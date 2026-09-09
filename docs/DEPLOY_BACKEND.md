# Deploy MARGOTS full-stack

The live UI on GitHub Pages is **static only**. It talks to a separate Python API.

## Architecture

```
Browser (GitHub Pages)
  → docs/api-client.js (API_BASE_URL)
  → HTTPS backend (Flask in backend.py)
  → core/bio_analyzer.py + core/llm_engine.py
```

## 1. Deploy the backend (Render)

`render.yaml` is already in the repo.

1. Go to [https://render.com](https://render.com) → New → Blueprint → connect `meenavignesh-svg/margots`.
2. Or: New Web Service → this repo → Runtime Python.
3. Build: `pip install -r requirements.txt`
4. Start: `gunicorn backend:app --bind 0.0.0.0:$PORT --workers 2 --timeout 90`
5. Health check path: `/health`

### Environment variables (Render dashboard)

| Variable | Required | Example |
|----------|----------|---------|
| `ALLOWED_ORIGINS` | **Yes** | `https://meenavignesh-svg.github.io,http://127.0.0.1:8000` |
| `OPENAI_API_KEY` | Optional | for AI interpretation |
| `OPENAI_MODEL` | Optional | `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | Optional | |
| `XAI_API_KEY` | Optional | |
| `GOOGLE_SEARCH_API_KEY` | Optional | for `/api/search` |
| `GOOGLE_SEARCH_ENGINE_ID` | Optional | |

Without AI keys the API still returns **deterministic facts** (sequence stats, table stats).

After deploy, open `https://YOUR-SERVICE.onrender.com/health` — you should see JSON with `"success": true`.

## 2. Point the frontend at the backend

Edit `docs/config.js` on `main`:

```js
window.MARGOTS_CONFIG = {
  API_BASE_URL: "https://YOUR-SERVICE.onrender.com"
};
```

Commit and push. The **Deploy Margots to GitHub Pages** workflow will publish the change.

Until `API_BASE_URL` is set, the UI uses `location.origin` (Pages itself) and shows **BACKEND OFFLINE**.

## 3. Local full-stack (verify before deploy)

```bash
# terminal 1 — API
pip install -r requirements.txt
export ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:8000
python backend.py
# or: gunicorn backend:app --bind 0.0.0.0:8000

# terminal 2 — static UI
python -m http.server 5500 --directory docs
```

Open http://127.0.0.1:5500 and set `docs/config.js` to `http://127.0.0.1:8000` (or leave empty only if you serve UI from the same origin as the API).

## 4. Smoke tests

```bash
pytest -q tests/test_backend.py
curl -s http://127.0.0.1:8000/health
curl -s -X POST http://127.0.0.1:8000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"mode":"sequence","sequence":"ATGCGTAA"}'
```

## Endpoints the frontend expects

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Status + AI providers |
| POST | `/api/analyze` | sequence / expression / variant / free |
| POST | `/api/search` | Google CSE (if keys configured) |
