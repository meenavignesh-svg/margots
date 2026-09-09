# MARGOTS Deployment

GitHub Pages hosts the **static frontend only**. The Python gateway must run on a separate host.

## Architecture

```text
Browser (docs/)  --HTTPS-->  FastAPI gateway (server/)  -->  core/ + LLM providers + public research APIs
```

## 1. Backend (Render / Railway / Fly / Docker)

```bash
pip install -r requirements-gateway.txt
cp .env.example .env   # fill secrets
uvicorn server.main:app --host 0.0.0.0 --port 8080
```

Docker:

```bash
docker build -f server/Dockerfile -t margots-gateway .
docker run -p 8080:8080 --env-file .env margots-gateway
```

Required env:

- `MARGOTS_CORS_ORIGINS` must include your Pages origin, e.g. `https://meenavignesh-svg.github.io`
- Optional: `OPENAI_API_KEY` + `OPENAI_MODEL`, Anthropic, xAI pairs

Health check: `GET /health` → `{ "success": true, "status": "healthy" }`

## 2. Frontend (GitHub Pages)

Already deployed from `docs/` via `.github/workflows/deploy-pages.yml`.

After backend is live, either:

1. Open **Settings** in the UI and paste the gateway URL, or
2. Inject before scripts in `docs/index.html`:

```html
<script>window.MARGOTS_API_BASE = 'https://YOUR-BACKEND.example.com';</script>
```

## 3. Local full stack

Terminal A (backend):

```bash
pip install -r requirements-gateway.txt
uvicorn server.main:app --reload --port 8080
```

Terminal B (frontend):

```bash
python -m http.server 8000 --directory docs
```

Open `http://localhost:8000`, Settings → API base `http://127.0.0.1:8080`.

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| GET | `/ready` | Agents configured? |
| POST | `/v1/sequence/analyze` | Deterministic ± AI |
| POST | `/v1/pipeline/plan` | SeqFlow pipeline plan |
| POST | `/v1/research/search` | Public literature fan-out |
| POST | `/v1/query` | Research + optional AI |
| POST | `/api` | Legacy search shape |
