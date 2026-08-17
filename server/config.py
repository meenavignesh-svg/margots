from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = "Margots Gateway"
    environment: str = os.getenv("MARGOTS_ENV", "development")
    host: str = os.getenv("MARGOTS_HOST", "0.0.0.0")
    port: int = int(os.getenv("MARGOTS_PORT", "8000"))
    cors_origins: tuple[str, ...] = tuple(
        x.strip() for x in os.getenv("MARGOTS_CORS_ORIGINS", "http://localhost:8000").split(",") if x.strip()
    )
    request_timeout: float = float(os.getenv("MARGOTS_REQUEST_TIMEOUT", "15"))
    max_query_chars: int = int(os.getenv("MARGOTS_MAX_QUERY_CHARS", "2000"))
    max_context_chars: int = int(os.getenv("MARGOTS_MAX_CONTEXT_CHARS", "30000"))
    rate_limit_per_minute: int = int(os.getenv("MARGOTS_RATE_LIMIT_PER_MINUTE", "60"))

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


settings = Settings()
