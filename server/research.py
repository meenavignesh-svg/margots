from __future__ import annotations

import asyncio
from typing import Any
from urllib.parse import quote

import httpx

from .config import settings
from .evidence import Evidence, make_evidence


class ResearchError(RuntimeError):
    pass


async def _get(client: httpx.AsyncClient, url: str) -> dict[str, Any]:
    r = await client.get(url, timeout=settings.request_timeout, headers={"User-Agent": "Margots/1.0 research-client"})
    r.raise_for_status()
    return r.json()


async def europe_pmc(client: httpx.AsyncClient, q: str) -> list[Evidence]:
    url = f"https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={quote(q)}&format=json&pageSize=8"
    data = await _get(client, url)
    out=[]
    for x in data.get("resultList", {}).get("result", []):
        ident=x.get("pmid") or x.get("doi")
        link=f"https://europepmc.org/article/MED/{ident}" if x.get("pmid") else (f"https://doi.org/{x['doi']}" if x.get("doi") else "https://europepmc.org/")
        out.append(make_evidence("Europe PMC", x.get("title", "Untitled"), link, ident, x.get("abstractText", "")))
    return out


async def openalex(client: httpx.AsyncClient, q: str) -> list[Evidence]:
    url=f"https://api.openalex.org/works?search={quote(q)}&per-page=8"
    data=await _get(client,url)
    out=[]
    for x in data.get("results",[]):
        ident=x.get("doi") or x.get("id")
        out.append(make_evidence("OpenAlex", x.get("title") or "Untitled", x.get("doi") or x.get("id") or "https://openalex.org/", ident, ""))
    return out


async def crossref(client: httpx.AsyncClient, q: str) -> list[Evidence]:
    url=f"https://api.crossref.org/works?query.bibliographic={quote(q)}&rows=8"
    data=await _get(client,url)
    out=[]
    for x in data.get("message",{}).get("items",[]):
        doi=x.get("DOI")
        out.append(make_evidence("Crossref", " ".join(x.get("title",[])) or "Untitled", f"https://doi.org/{doi}" if doi else x.get("URL", "https://www.crossref.org/"), doi, ""))
    return out


async def semantic_scholar(client: httpx.AsyncClient, q: str) -> list[Evidence]:
    url=f"https://api.semanticscholar.org/graph/v1/paper/search?query={quote(q)}&limit=8&fields=title,abstract,year,url,externalIds"
    data=await _get(client,url)
    out=[]
    for x in data.get("data",[]):
        ids=x.get("externalIds") or {}
        ident=ids.get("DOI") or ids.get("PubMed") or x.get("paperId")
        out.append(make_evidence("Semantic Scholar", x.get("title") or "Untitled", x.get("url") or "https://www.semanticscholar.org/", ident, x.get("abstract") or ""))
    return out


async def search_all(q: str) -> dict[str, Any]:
    q=q.strip()
    if not q or len(q)>settings.max_query_chars:
        raise ResearchError("Query is empty or exceeds the configured size limit.")
    async with httpx.AsyncClient(follow_redirects=True) as client:
        jobs=[europe_pmc(client,q),openalex(client,q),crossref(client,q),semantic_scholar(client,q)]
        results=await asyncio.gather(*jobs,return_exceptions=True)
    evidence=[]; errors=[]
    for name,result in zip(["Europe PMC","OpenAlex","Crossref","Semantic Scholar"],results):
        if isinstance(result,Exception): errors.append({"source":name,"error":f"{type(result).__name__}: {result}"})
        else: evidence.extend(result)
    # Stable de-duplication by identifier or URL.
    unique={}
    for item in evidence: unique[item.identifier or item.url]=item
    return {"query":q,"count":len(unique),"evidence":[x.as_dict() for x in unique.values()],"errors":errors}
