# MARGOTS — Full-Stack Getting Started

## Architecture

```text
Browser / GitHub Pages
        │ HTTPS JSON
        ▼
MARGOTS Flask API
        │
        ├── deterministic bioinformatics (BioPython / pandas)
        └── optional server-side AI providers
```

GitHub Pages serves only the static frontend. The Python API must be deployed separately.

## Local development

### 1. Clone and install

```bash
git clone https://github.com/meenavignesh-svg/margots.git
cd margots
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env  # macOS/Linux
```

### 2. Start the API

```bash
python backend.py
```

The API is available at `http://127.0.0.1:8000` and health is `GET /health`.

### 3. Start the frontend

In a second terminal:

```bash
python -m http.server 8080 --directory docs
```

Open `http://localhost:8080`.

For local frontend→backend communication, set `docs/config.js` to:

```js
window.MARGOTS_CONFIG = { API_BASE_URL: "http://127.0.0.1:8000" };
```

### 4. Optional AI

Set a provider key **and its matching model** in `.env`. Keys never belong in `docs/` or browser localStorage.

Supported server-side providers:

- `OPENAI_API_KEY` + `OPENAI_MODEL`
- `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL`
- `XAI_API_KEY` + `XAI_MODEL`

MARGOTS continues to provide deterministic analysis when no AI provider is configured.

## API

- `GET /health` — backend status and configured AI roles
- `POST /api/analyze` — sequence, expression, variant, and free analysis
- `POST /api/search` — optional Google Custom Search gateway

Successful responses use:

```json
{"success":true,"data":{},"error":null}
```

Errors use:

```json
{"success":false,"data":null,"error":{"code":"ERROR_CODE","message":"Human-readable message"}}
```

## GitHub Pages deployment

Set a GitHub Actions repository/environment variable named `MARGOTS_API_BASE_URL` to the public **HTTPS** backend URL, for example `https://your-backend.example.com`. The Pages workflow injects it into `docs/config.js` at deployment time.

Do not put API keys in GitHub Pages variables or frontend source.

## Render backend deployment

The repository includes `render.yaml`.

1. Create a Render Web Service from this repository.
2. Use the generated Python service configuration.
3. Set `ALLOWED_ORIGINS` to the exact GitHub Pages origin, e.g. `https://meenavignesh-svg.github.io`.
4. Add optional AI/search secrets in Render environment variables.
5. Confirm `https://YOUR-BACKEND/health` returns `success: true`.
6. Set GitHub's `MARGOTS_API_BASE_URL` to that backend URL and redeploy Pages.

## Tests

```bash
pytest -q tests
node docs/tests/bio-core.test.js
python -m compileall app.py backend.py core tools
```

## Scientific boundary

MARGOTS is an educational/research tool. AI interpretations are not experimental, clinical, diagnostic, or regulatory validation. Verify important claims against appropriate databases, primary literature, and domain expertise.
