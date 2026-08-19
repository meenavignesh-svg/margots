from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from hashlib import sha256
from typing import Any


@dataclass(frozen=True)
class Evidence:
    source: str
    title: str
    url: str
    identifier: str | None = None
    retrieved_at: str = ""
    excerpt: str = ""

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


def make_evidence(source: str, title: str, url: str, identifier: str | None = None, excerpt: str = "") -> Evidence:
    return Evidence(
        source=source,
        title=title.strip(),
        url=url,
        identifier=identifier,
        retrieved_at=datetime.now(timezone.utc).isoformat(),
        excerpt=excerpt.strip()[:1200],
    )


def evidence_id(e: Evidence) -> str:
    return sha256(f"{e.source}|{e.identifier or ''}|{e.url}".encode()).hexdigest()[:16]


def build_context(items: list[Evidence], max_chars: int = 30000) -> str:
    chunks: list[str] = []
    used = 0
    for e in items:
        chunk = f"SOURCE: {e.source}\nTITLE: {e.title}\nID: {e.identifier or 'n/a'}\nURL: {e.url}\nEXCERPT: {e.excerpt}\n"
        if used + len(chunk) > max_chars:
            break
        chunks.append(chunk)
        used += len(chunk)
    return "\n---\n".join(chunks)
