# MARGOTS Architecture

MARGOTS keeps the existing browser-first scientific workspace while adding a real server boundary for API access and AI secrets.

## Production flow

```text
User
 ↓
GitHub Pages static frontend
 ↓ HTTPS / JSON
Flask API (backend.py)
 ↓
Analyzer
 ├── deterministic sequence analysis (BioPython)
 └── deterministic table analysis (pandas)
 ↓
Engine
 ├── Anthropic / strict role
 ├── OpenAI / context role
 └── xAI / skeptic role
 ↓
JSON response
 ↓
Frontend result cards + history
```

Optional search follows:

```text
Frontend → POST /api/search → Flask → Google Custom Search → safe result objects → Frontend
```

## Components

### `docs/`
Static UI for GitHub Pages. `api-client.js` is the only frontend network abstraction and reads `window.MARGOTS_CONFIG.API_BASE_URL`.

### `backend.py`
Flask HTTP API. It owns validation, request limits, CORS, deterministic analysis, search proxying, and server-side provider access.

### `core/bio_analyzer.py`
Calculates sequence and table facts. These calculations do not require an AI key.

### `core/llm_engine.py`
Creates provider clients only when both a key and model are configured. Calls have explicit timeouts and provider failures are isolated per role.

### `api/` and `functions/`
Existing deployment-specific search gateways are retained for compatibility. The canonical GitHub Pages + Render path is `backend.py` + `/api/search`.

## API contract

All canonical API responses have the shape:

```json
{"success":true,"data":{},"error":null}
```

or:

```json
{"success":false,"data":null,"error":{"code":"ERROR_CODE","message":"Human-readable message"}}
```

Endpoints:

- `GET /health`
- `POST /api/analyze`
- `POST /api/search`

## Security boundary

```text
Browser
  │ public data only
  ▼
HTTPS API
  │ secrets stay here
  ├── AI providers
  └── Google Search
```

No provider credential is embedded in the frontend. Production CORS should contain the exact deployed frontend origin(s), not a wildcard.

## Deployment

- Frontend: GitHub Pages from `docs/`.
- Backend: Python-compatible host such as Render, using `gunicorn backend:app`.
- Pages workflow injects the backend URL from the `MARGOTS_API_BASE_URL` GitHub Actions variable.

## Scientific boundary

Deterministic measurements are separated from AI interpretation. AI output is advisory and must not be presented as experimental, clinical, or diagnostic validation.
