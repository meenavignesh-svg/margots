from __future__ import annotations

import asyncio
import os
import time
from collections import defaultdict, deque
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from core.bio_analyzer import seq_stats
from .config import settings
from .research import search_all

app = FastAPI(title="Margots Gateway", version="1.0.0", docs_url="/docs", redoc_url="/redoc")
app.add_middleware(CORSMiddleware, allow_origins=list(settings.cors_origins), allow_credentials=False, allow_methods=["GET","POST"], allow_headers=["*"])

_buckets: dict[str, deque[float]] = defaultdict(deque)


class Query(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    context: str = Field(default="", max_length=30000)


class SequenceRequest(BaseModel):
    sequence: str = Field(min_length=1, max_length=200000)
    question: str = Field(default="", max_length=2000)


def rate_limit(request: Request) -> None:
    ip=request.client.host if request.client else "unknown"
    now=time.monotonic(); q=_buckets[ip]
    while q and now-q[0]>60:q.popleft()
    if len(q)>=settings.rate_limit_per_minute: raise HTTPException(429,"Rate limit exceeded")
    q.append(now)


@app.middleware("http")
async def guard(request: Request, call_next):
    if request.url.path not in {"/health","/ready"}: rate_limit(request)
    response=await call_next(request)
    response.headers["X-Content-Type-Options"]="nosniff"
    response.headers["X-Frame-Options"]="DENY"
    response.headers["Referrer-Policy"]="no-referrer"
    response.headers["Cache-Control"]="no-store"
    return response


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"status":"ok","service":"margots-gateway","environment":settings.environment}


@app.get("/ready")
async def ready() -> dict[str, Any]:
    return {"ready":True,"research":True,"llm_provider_keys":sum(bool(os.getenv(x)) for x in ("OPENAI_API_KEY","ANTHROPIC_API_KEY","XAI_API_KEY"))}


@app.post("/v1/research/search")
async def research(request: Request, body: Query):
    result=await search_all(body.query)
    return result


@app.post("/v1/sequence/analyze")
async def sequence(request: Request, body: SequenceRequest):
    facts=seq_stats(body.sequence)
    return {"facts":facts,"question":body.question,"interpretation_available":bool(os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY") or os.getenv("XAI_API_KEY"))}


@app.post("/v1/query")
async def query(request: Request, body: Query):
    # The first production milestone is evidence retrieval. LLM orchestration stays behind server-side keys.
    research_result=await search_all(body.query)
    return {"query":body.query,"research":research_result,"ai":{"status":"configure_server_keys"}}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host=settings.host, port=settings.port, reload=settings.environment!="production")
