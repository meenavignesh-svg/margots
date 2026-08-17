# Margots production architecture

## System boundary

Margots is split into two layers:

1. **GitHub Pages frontend** — UI, deterministic browser-safe sequence utilities, optional user-side providers, games, and progressive enhancement.
2. **Production gateway** — server-side API credentials, research aggregation, rate limiting, provenance, provider orchestration, and operational controls.

## Evidence contract

Scientific answers must distinguish:

- **Measured facts**: calculated directly from supplied data.
- **Retrieved evidence**: information returned by named external sources.
- **Interpretation**: model-generated synthesis.
- **Uncertainty**: missing data, conflicting sources, or assumptions.

The gateway never treats a model response as experimental validation.

## Research fan-out

`POST /v1/research/search` queries multiple public indexes concurrently. A provider failure is isolated, successful providers still return results, and records are de-duplicated by identifier/URL.

## Security contract

- No leaked or scraped API credentials.
- Server credentials come from environment/secret management.
- Browser credentials are never copied to the repository.
- CORS is explicit rather than wildcard in production.
- Requests are bounded by query/context size and a simple IP rate limit.
- Response headers include basic browser hardening controls.
- CI runs compilation, tests, and a credential-pattern scan.

## Deployment

The Pages workflow injects `production-runtime.js` into the published site without modifying the source HTML. The runtime loads the games integration and exposes the research panel. Set `MARGOTS_GATEWAY_URL` through a deployment-specific build step when a gateway is hosted.

## Future extension points

- Redis-backed rate limiting
- persistent evidence cache
- provider health scoring
- signed audit events
- authenticated user accounts
- job queue for large files
- object storage for uploaded datasets
- structured citation extraction
- evaluation datasets and regression benchmarks
- observability/tracing
