"""MARGOTS production HTTP API.

The static GitHub Pages frontend calls this service over HTTPS. Secrets remain
server-side; deterministic bioinformatics is performed locally and AI is optional.
"""
import logging
import os
from functools import lru_cache
from typing import Any

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from core.bio_analyzer import Analyzer
from core.llm_engine import Engine

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
log = logging.getLogger("margots")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_REQUEST_BYTES", str(10 * 1024 * 1024)))


def allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "")
    return [x.strip() for x in raw.split(",") if x.strip()]

origins = allowed_origins()
CORS(
    app,
    origins=origins or ["http://localhost:8000", "http://127.0.0.1:8000"],
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
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


@app.get("/health")
def health():
    engine, _ = services()
    return ok({"status": "healthy", "ai_providers": engine.available()})


@app.get("/")
def root():
    return ok({"service": "MARGOTS API", "health": "/health", "analyze": "/api/analyze"})


@app.post("/api/analyze")
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
            return ok(result_payload(analyzer.variant(text)))

        if mode == "free":
            context = str(body.get("context", "")).strip()
            question = str(body.get("question", "")).strip()
            if not context or not question:
                return fail("MISSING_INPUT", "context and question are required.", 422)
            return ok(result_payload(analyzer.free(context, question)))

        # Expression/table analysis accepts JSON rows or CSV/TSV text.
        rows = body.get("rows")
        text = body.get("text")
        if rows is not None:
            if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
                return fail("INVALID_ROWS", "rows must be a list of objects.", 422)
            df = pd.DataFrame(rows)
        elif isinstance(text, str) and text.strip():
            import io
            sep = "\t" if body.get("format", "csv").lower() in {"tsv", "txt"} else ","
            df = pd.read_csv(io.StringIO(text), sep=sep)
        else:
            return fail("MISSING_TABLE", "Provide rows or CSV/TSV text.", 422)
        if df.empty:
            return fail("EMPTY_TABLE", "The supplied table contains no data rows.", 422)
        return ok(result_payload(analyzer.expression(df, body.get("question"))))
    except pd.errors.ParserError:
        return fail("INVALID_TABLE", "The uploaded table could not be parsed.", 422)
    except ValueError as exc:
        log.info("Validation failure: %s", exc)
        return fail("INVALID_INPUT", "The supplied input could not be processed.", 422)
    except Exception:
        log.exception("Unhandled analysis failure")
        return fail("INTERNAL_ERROR", "Analysis failed on the server. Try again later.", 500)


@app.errorhandler(413)
def too_large(_):
    return fail("PAYLOAD_TOO_LARGE", "Request exceeds the configured size limit.", 413)


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
