"""MARGOTS production HTTP API.

The static GitHub Pages frontend calls this service over HTTPS. Secrets remain
server-side; deterministic bioinformatics is performed locally and AI is optional.
"""
import io
import logging
import os
from functools import lru_cache
from typing import Any

import pandas as pd
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from core.bio_analyzer import Analyzer
from core.llm_engine import Engine

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
log = logging.getLogger("margots")
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_REQUEST_BYTES", str(10 * 1024 * 1024)))


def allowed_origins() -> list[str]:
    configured = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "").split(",") if x.strip()]
    return configured or [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]


CORS(app, origins=allowed_origins(), methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type"])

# Rate limiting is intentionally server-side. Set RATELIMIT_STORAGE_URI to a
# shared Redis URI in multi-instance production deployments.
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=[os.getenv("RATE_LIMIT_DEFAULT", "120 per minute")],
    storage_uri=os.getenv("RATELIMIT_STORAGE_URI", "memory://"),
    headers_enabled=True,
)


@lru_cache(maxsize=1)
def services() -> tuple[Engine, Analyzer]:
    engine = Engine()
    return engine, Analyzer(engine)


def ok(data: Any, status: int = 200):
    return jsonify({"success": True, "data": data, "error": None}), status


def fail(code: str, message: str, status: int):
    return jsonify({"success": False, "data": None, "error": {"code": code, "message": message}}), status


def result_payload(result):
    return {"facts": result.facts, "outputs": result.outputs, "errors": result.errors}


@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if request.is_secure:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.get("/health")
@limiter.limit("30 per minute")
def health():
    engine, _ = services()
    return ok({"status": "healthy", "ai_providers": engine.available()})


@app.get("/")
def root():
    return ok({"service": "MARGOTS API", "health": "/health", "analyze": "/api/analyze", "search": "/api/search"})


@app.post("/api/search")
@limiter.limit(os.getenv("SEARCH_RATE_LIMIT", "20 per minute"))
def search():
    body = request.get_json(silent=True)
    query = str(body.get("query", "")).strip() if isinstance(body, dict) else ""
    if not query:
        return fail("MISSING_QUERY", "query is required.", 400)
    key, cx = os.getenv("GOOGLE_SEARCH_API_KEY"), os.getenv("GOOGLE_SEARCH_ENGINE_ID")
    if not key or not cx:
        return fail("SEARCH_NOT_CONFIGURED", "Search provider is not configured on this backend.", 503)
    try:
        r = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params={"key": key, "cx": cx, "q": query[:300], "safe": "active", "num": 8},
            timeout=10,
        )
        data = r.json()
        if not r.ok:
            return fail("SEARCH_UPSTREAM", "Search provider rejected the request.", 502)
        items = [
            {"title": x.get("title", ""), "url": x.get("link", ""), "snippet": x.get("snippet", "")}
            for x in data.get("items", [])
        ]
        return ok({"query": query, "results": items})
    except requests.RequestException:
        return fail("SEARCH_TIMEOUT", "Search provider could not be reached.", 502)


@app.post("/api/analyze")
@limiter.limit(os.getenv("ANALYZE_RATE_LIMIT", "30 per minute"))
def analyze():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return fail("INVALID_JSON", "Request body must be a JSON object.", 400)
    mode = str(body.get("mode", "")).strip().lower()
    if mode not in {"sequence", "expression", "variant", "free"}:
        return fail("INVALID_MODE", "mode must be sequence, expression, variant, or free.", 422)

    _, analyzer = services()
    try:
        if mode == "sequence":
            sequence = str(body.get("sequence", ""))
            if not sequence.strip():
                return fail("MISSING_SEQUENCE", "sequence is required.", 422)
            if len(sequence) > 100_000:
                return fail("SEQUENCE_TOO_LARGE", "Sequence exceeds the 100,000-character limit.", 422)
            question = body.get("question")
            if question is not None and not isinstance(question, str):
                return fail("INVALID_QUESTION", "question must be a string.", 422)
            result = analyzer.sequence(sequence, question)
            if result.facts.get("kind") == "invalid":
                return fail("INVALID_SEQUENCE", result.facts.get("message", "Invalid sequence."), 422)
            return ok(result_payload(result))

        if mode == "variant":
            text = str(body.get("variant", "")).strip()
            if not text:
                return fail("MISSING_VARIANT", "variant is required.", 422)
            if len(text) > 10_000:
                return fail("VARIANT_TOO_LARGE", "Variant description is too large.", 422)
            return ok(result_payload(analyzer.variant(text)))

        if mode == "free":
            context = str(body.get("context", "")).strip()
            question = str(body.get("question", "")).strip()
            if not context or not question:
                return fail("MISSING_INPUT", "context and question are required.", 422)
            if len(context) > 20_000 or len(question) > 5_000:
                return fail("INPUT_TOO_LARGE", "Question or context exceeds the configured limit.", 422)
            return ok(result_payload(analyzer.free(context, question)))

        rows, text = body.get("rows"), body.get("text")
        if rows is not None:
            if not isinstance(rows, list) or len(rows) > 20_000 or not all(isinstance(row, dict) for row in rows):
                return fail("INVALID_ROWS", "rows must be a list of at most 20,000 objects.", 422)
            df = pd.DataFrame(rows)
        elif isinstance(text, str) and text.strip():
            if len(text) > 8 * 1024 * 1024:
                return fail("TABLE_TOO_LARGE", "Table text exceeds the 8 MB limit.", 422)
            sep = "\t" if str(body.get("format", "csv")).lower() in {"tsv", "txt"} else ","
            df = pd.read_csv(io.StringIO(text), sep=sep)
        else:
            return fail("MISSING_TABLE", "Provide rows or CSV/TSV text.", 422)
        if df.empty:
            return fail("EMPTY_TABLE", "The supplied table contains no data rows.", 422)
        return ok(result_payload(analyzer.expression(df, body.get("question"))))
    except pd.errors.ParserError:
        return fail("INVALID_TABLE", "The supplied table could not be parsed.", 422)
    except ValueError:
        return fail("INVALID_INPUT", "The supplied input could not be processed.", 422)
    except Exception:
        log.exception("Unhandled analysis failure")
        return fail("INTERNAL_ERROR", "Analysis failed on the server. Try again later.", 500)


@app.errorhandler(413)
def too_large(_):
    return fail("PAYLOAD_TOO_LARGE", "Request exceeds the configured size limit.", 413)


@app.errorhandler(429)
def rate_limited(_):
    return fail("RATE_LIMITED", "Too many requests. Please wait and try again.", 429)


@app.errorhandler(404)
def not_found(_):
    return fail("NOT_FOUND", "Endpoint not found.", 404)


@app.errorhandler(405)
def method_not_allowed(_):
    return fail("METHOD_NOT_ALLOWED", "HTTP method is not supported for this endpoint.", 405)


@app.errorhandler(Exception)
def unhandled(exc):
    log.exception("Unhandled HTTP failure", exc_info=exc)
    return fail("INTERNAL_ERROR", "Unexpected server error.", 500)


if __name__ == "__main__":
    app.run(host=os.getenv("HOST", "0.0.0.0"), port=int(os.getenv("PORT", "8000")))
