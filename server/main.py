"""MARGOTS FastAPI gateway — server-side secrets, deterministic core, optional AI."""

from __future__ import annotations

import logging
import os
import time
from collections import defaultdict, deque
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from core.bio_analyzer import Analyzer, seq_stats
from core.llm_engine import Engine
from core.pipeline_agent import detect_assay, local_pipeline_skeleton

from .config import settings
from .research import ResearchError, search_all

logger = logging.getLogger("margots")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Margots Gateway",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

_buckets: dict[str, deque[float]] = defaultdict(deque)
_engine: Optional[Engine] = None
_analyzer: Optional[Analyzer] = None


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = Engine()
    return _engine


def get_analyzer() -> Analyzer:
    global _analyzer
    if _analyzer is None:
        _analyzer = Analyzer(get_engine())
    return _analyzer


def ok(data: Any = None) -> dict[str, Any]:
    return {"success": True, "data": data if data is not None else {}, "error": None}


def fail(code: str, message: str, status: int = 400) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "success": False,
            "data": None,
            "error": {"code": code, "message": message},
        },
    )


class SequenceRequest(BaseModel):
    sequence: str = Field(min_length=1, max_length=200000)
    question: str = Field(default="", max_length=4000)
    with_ai: bool = False


class QueryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=4000)
    context: str = Field(default="", max_length=30000)
    with_ai: bool = False


class PipelineRequest(BaseModel):
    design: str = Field(min_length=1, max_length=8000)
    organism: str = Field(default="", max_length=200)
    data_type: str = Field(default="", max_length=200)
    constraints: str = Field(default="", max_length=2000)
    with_ai: bool = True


class VariantRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    with_ai: bool = False


def rate_limit(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    q = _buckets[ip]
    while q and now - q[0] > 60:
        q.popleft()
    if len(q) >= settings.rate_limit_per_minute:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    q.append(now)


@app.middleware("http")
async def guard(request: Request, call_next):
    if request.url.path not in {"/health", "/ready", "/"}:
        try:
            rate_limit(request)
        except HTTPException as e:
            return fail("RATE_LIMIT", str(e.detail), 429)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/")
async def root():
    return ok(
        {
            "service": "margots-gateway",
            "version": "1.1.0",
            "docs": "/docs",
            "health": "/health",
        }
    )


@app.get("/health")
async def health():
    return {
        "success": True,
        "status": "healthy",
        "service": "margots-gateway",
        "environment": settings.environment,
    }


@app.get("/ready")
async def ready():
    eng = get_engine()
    return ok(
        {
            "ready": True,
            "agents": eng.available(),
            "pipeline_agents": eng.available_pipeline_roles(),
            "llm_configured": bool(eng.available()),
        }
    )


@app.post("/v1/sequence/analyze")
async def sequence_analyze(body: SequenceRequest):
    try:
        facts = seq_stats(body.sequence)
        if facts.get("error"):
            return fail("INVALID_SEQUENCE", facts.get("message") or facts["error"], 422)

        data: dict[str, Any] = {
            "facts": facts,
            "question": body.question or None,
            "outputs": {},
            "errors": {},
            "mode": "sequence",
        }

        if body.with_ai:
            result = get_analyzer().sequence(body.sequence, body.question or None)
            data["outputs"] = result.outputs
            data["errors"] = result.errors

        return ok(data)
    except Exception:
        logger.exception("sequence_analyze failed")
        return fail("INTERNAL_ERROR", "Sequence analysis failed.", 500)


@app.post("/v1/variant/analyze")
async def variant_analyze(body: VariantRequest):
    try:
        data: dict[str, Any] = {
            "facts": {"source": "user text only", "text_preview": body.text[:200]},
            "outputs": {},
            "errors": {},
            "mode": "variant",
        }
        if body.with_ai:
            result = get_analyzer().variant(body.text)
            data["outputs"] = result.outputs
            data["errors"] = result.errors
        else:
            data["outputs"] = {
                "note": "AI interpretation not requested. Set with_ai=true when providers are configured."
            }
        return ok(data)
    except Exception:
        logger.exception("variant_analyze failed")
        return fail("INTERNAL_ERROR", "Variant analysis failed.", 500)


@app.post("/v1/pipeline/plan")
async def pipeline_plan(body: PipelineRequest):
    try:
        skeleton = local_pipeline_skeleton(
            body.design, detect_assay(body.design + " " + body.data_type)
        )
        data: dict[str, Any] = {
            "facts": skeleton,
            "outputs": {},
            "errors": {},
            "mode": "pipeline",
        }
        if body.with_ai:
            result = get_analyzer().pipeline(
                design=body.design,
                organism=body.organism,
                data_type=body.data_type,
                constraints=body.constraints,
            )
            data["facts"] = result.facts
            data["outputs"] = result.outputs
            data["errors"] = result.errors
            if not result.outputs and not result.errors:
                data["outputs"] = {
                    "note": (
                        "No AI providers configured. Deterministic pipeline skeleton is shown in facts. "
                        "Set OPENAI_API_KEY / ANTHROPIC_API_KEY / XAI_API_KEY and matching *_MODEL on the server."
                    )
                }
        return ok(data)
    except Exception:
        logger.exception("pipeline_plan failed")
        return fail("INTERNAL_ERROR", "Pipeline planning failed.", 500)


@app.post("/v1/research/search")
async def research_search(body: QueryRequest):
    try:
        result = await search_all(body.query)
        return ok(result)
    except ResearchError as e:
        return fail("INVALID_QUERY", str(e), 422)
    except Exception:
        logger.exception("research_search failed")
        return fail("INTERNAL_ERROR", "Research search failed.", 500)


@app.post("/v1/query")
async def unified_query(body: QueryRequest):
    """Unified entry: literature + optional multi-agent interpretation."""
    try:
        research = await search_all(body.query)
        data: dict[str, Any] = {
            "query": body.query,
            "research": research,
            "outputs": {},
            "errors": {},
            "mode": "query",
        }
        if body.with_ai:
            ctx = body.context or ""
            evidence_bits = []
            for e in research.get("evidence", [])[:8]:
                evidence_bits.append(
                    f"{e.get('source')}: {e.get('title')} ({e.get('url')})"
                )
            context_block = (
                ctx + "\n\nLITERATURE:\n" + "\n".join(evidence_bits)
                if evidence_bits
                else ctx
            )
            result = get_analyzer().free(context_block, body.query)
            data["outputs"] = result.outputs
            data["errors"] = result.errors
            if not result.outputs and not result.errors:
                data["outputs"] = {
                    "note": "No AI providers configured on the server."
                }
        return ok(data)
    except ResearchError as e:
        return fail("INVALID_QUERY", str(e), 422)
    except Exception:
        logger.exception("unified_query failed")
        return fail("INTERNAL_ERROR", "Query failed.", 500)


# Compatibility alias used by older frontend snippets
@app.post("/api")
async def legacy_api(request: Request):
    try:
        body = await request.json()
    except Exception:
        return fail("INVALID_JSON", "Request body must be JSON.", 400)
    action = (body.get("action") or "search").lower()
    if action == "search":
        q = str(body.get("query") or "").strip()
        if not q:
            return fail("INVALID_QUERY", "query required", 400)
        try:
            result = await search_all(q)
            # Shape compatible with older UI expecting results[]
            results = [
                {
                    "title": e.get("title"),
                    "url": e.get("url"),
                    "snippet": e.get("excerpt") or e.get("source", ""),
                }
                for e in result.get("evidence", [])
            ]
            return JSONResponse(
                {"query": q, "results": results, "success": True, "data": result, "error": None}
            )
        except Exception:
            logger.exception("legacy search failed")
            return fail("INTERNAL_ERROR", "Search failed.", 500)
    return fail("UNKNOWN_ACTION", f"Unknown action: {action}", 400)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment != "production",
    )
