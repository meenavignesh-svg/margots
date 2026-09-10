# MARGOTS + Ollama

MARGOTS can run its AI reasoning locally through Ollama. This mode requires **no AI API key** and has no cloud per-request quota. The practical limit is the CPU/RAM/GPU of the computer running Ollama.

## 1. Install Ollama

Install Ollama for your operating system from the official Ollama website.

## 2. Download a model

For a lightweight local setup:

```bash
ollama pull qwen2.5:1.5b
```

You can use another Ollama model by changing `OLLAMA_MODEL` in `.env`.

## 3. Start the MARGOTS backend

Create `.env` from `.env.example` and keep the local defaults:

```text
OLLAMA_ENABLED=1
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:1.5b
LLM_TIMEOUT_SECONDS=90
```

Then run:

```bash
python backend.py
```

The backend will send MARGOTS analysis prompts to Ollama at `/api/chat`.

## 4. Run the frontend locally

In a second terminal:

```bash
python -m http.server 8080 --directory docs
```

Set the local API URL in `docs/config.js`:

```js
window.MARGOTS_CONFIG = {
  API_BASE_URL: "http://127.0.0.1:8000"
};
```

Then open:

```text
http://127.0.0.1:8080
```

## Important: GitHub Pages

The public GitHub Pages site cannot directly reach `127.0.0.1` on your computer. Therefore the **local Ollama mode is for a locally running MARGOTS backend/frontend**.

The deployed Render backend remains a separate cloud service. To use Ollama with a cloud deployment, Ollama must run on a reachable server and `OLLAMA_BASE_URL` must point to that server. Do not expose an unauthenticated Ollama instance to the public internet.

## Security

- No Ollama API key is required.
- MARGOTS does not store an Ollama credential.
- Biological inputs sent to Ollama stay on the machine/network where Ollama runs.
- Do not expose Ollama directly to the public internet without authentication and network controls.
- AI output remains an interpretation layer; deterministic measurements remain the source of calculated facts.
