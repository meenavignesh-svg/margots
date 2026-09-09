<div align="center">

# 🧬 MARGOTS
### **AI-Native Genomic Workflow & Bioinformatics Automation Platform**

**Deterministic sequence analysis first. Optional multi-agent AI on the server. Literature evidence from public APIs.**

<a href="https://meenavignesh-svg.github.io/margots/"><img src="https://img.shields.io/badge/🚀_LIVE_FRONTEND-GitHub_Pages-10a37f?style=for-the-badge"/></a>
<a href="https://github.com/meenavignesh-svg/margots"><img src="https://img.shields.io/badge/⭐_GITHUB-Repository-111827?style=for-the-badge&logo=github&logoColor=white"/></a>

![Status](https://img.shields.io/badge/status-active_development-f59e0b?style=for-the-badge)
![License](https://img.shields.io/github/license/meenavignesh-svg/margots?style=for-the-badge)

</div>

---

## What works today

| Layer | Capability |
|-------|------------|
| **Frontend** (`docs/`) | Chat UI, sequence/pipeline/research modes, health indicator, configurable API base |
| **Gateway** (`server/`) | FastAPI: `/health`, sequence analyze, pipeline plan, research search, unified query |
| **Core** (`core/`) | Deterministic `seq_stats`, multi-agent LLM engine, SeqFlow pipeline skeletons |
| **Browser fallback** | `bio-core.js` + public literature APIs when backend is offline |

GitHub Pages **cannot** run Python. Deploy the gateway separately, then set the API base in the UI Settings panel.

MARGOTS is for education and research exploration — **not** a clinical diagnostic system.

---

## Architecture

```text
USER
  ↓
FRONTEND (docs/)  — config.js + api-client.js + app-main.js
  ↓  HTTPS
GATEWAY (server/main.py)  — CORS, rate limit, JSON envelope
  ↓
CORE — bio_analyzer, pipeline_agent, llm_engine
  ↓
External: OpenAI / Anthropic / xAI (optional) + Europe PMC / OpenAlex / Crossref / Semantic Scholar
```

Response shape:

```json
{ "success": true, "data": {}, "error": null }
```

```json
{ "success": false, "data": null, "error": { "code": "ERROR_CODE", "message": "…" } }
```

---

## Quick start (full stack locally)

### Backend

```bash
git clone https://github.com/meenavignesh-svg/margots.git
cd margots
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-gateway.txt
cp .env.example .env        # optional: add LLM keys + models
uvicorn server.main:app --reload --port 8080
```

Check: http://127.0.0.1:8080/health

### Frontend

```bash
python -m http.server 8000 --directory docs
```

Open http://localhost:8000 → **Settings** → API base `http://127.0.0.1:8080` → Save & check health.

### Tests

```bash
node docs/tests/bio-core.test.js
pip install -r requirements-gateway.txt pytest
pytest -q tests/test_gateway.py
```

### Optional Streamlit UI

```bash
pip install -r requirements.txt
streamlit run app.py
```

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness `{ success, status: "healthy" }` |
| GET | `/ready` | Configured agents |
| POST | `/v1/sequence/analyze` | Body: `{ sequence, question?, with_ai? }` |
| POST | `/v1/pipeline/plan` | Body: `{ design, organism?, data_type?, constraints?, with_ai? }` |
| POST | `/v1/research/search` | Body: `{ query }` |
| POST | `/v1/query` | Research + optional AI |
| POST | `/api` | Legacy search compatibility |
| GET | `/docs` | OpenAPI UI |

---

## Environment variables

See `.env.example` and `server/.env.example`.

| Variable | Purpose |
|----------|---------|
| `MARGOTS_CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `MARGOTS_PORT` | Gateway port (default 8080) |
| `OPENAI_API_KEY` + `OPENAI_MODEL` | Server-side agents |
| `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL` | Server-side agents |
| `XAI_API_KEY` + `XAI_MODEL` | Server-side agents |

**Never** put provider keys in `docs/` JavaScript.

---

## Deploy

Full guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

1. **Frontend:** GitHub Pages from `docs/` (workflow already present).
2. **Backend:** Render / Railway / Fly / Docker (`server/Dockerfile`).
3. Set `MARGOTS_CORS_ORIGINS` to include `https://meenavignesh-svg.github.io`.
4. In the live UI, open Settings and paste the backend URL (or inject `window.MARGOTS_API_BASE`).

---

## Security boundaries

- Secrets only in server env / host secret store
- Rate limiting and basic security headers on the gateway
- XSS-safe message rendering in the production UI
- Do not upload patient-identifiable data unless deployment and providers are authorized

---

## License

See [LICENSE](LICENSE).

<div align="center">

### 🧬 MARGOTS
**AI-Native Bioinformatics · Genomic Workflow Automation · Scientific AI**

</div>
