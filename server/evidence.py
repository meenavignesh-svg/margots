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


def make_evidence(
    source: str,
    title: str,
    url: str,
    identifier: str | None = None,
    excerpt: str = "",
) -> Evidence:
    return Evidence(
        source=source,
        title=(title or "").strip(),
        url=url,
        identifier=identifier,
        retrieved_at=datetime.now(timezone.utc).isoformat(),
        excerpt=(excerpt or "").strip()[:1200],
    )


def evidence_id(e: Evidence) -> str:
    return sha256(f"{e.source}|{e.identifier or ''}|{e.url}".encode()).hexdigest()[:16]
