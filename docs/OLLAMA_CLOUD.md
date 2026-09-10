# MARGOTS + Ollama Cloud

MARGOTS can use Ollama Cloud as its online AI provider while keeping the Ollama API key server-side.

## 1. Create an Ollama API key

Create an API key in your Ollama account. Direct programmatic access to `https://ollama.com/api` requires an Ollama API key.

## 2. Add the key to Render

Open the `margots-api` Render service and add:

```text
OLLAMA_API_KEY=<your Ollama API key>
OLLAMA_CLOUD_URL=https://ollama.com
OLLAMA_CLOUD_MODEL=gpt-oss:20b
```

Do **not** put this key in GitHub, `docs/`, `config.js`, localStorage, or the browser.

## 3. How MARGOTS chooses the provider

```text
OLLAMA_API_KEY present?
        |
       yes ──> Ollama Cloud (online)
        |
       no
        |
        v
Local Ollama at 127.0.0.1:11434
```

This means local development can still work without a key, while the deployed Render backend uses Ollama Cloud when the server secret is configured.

## 4. Security

The browser never receives `OLLAMA_API_KEY`. MARGOTS sends the analysis request to its own backend, and only the backend contacts Ollama Cloud.

## 5. Usage

Ollama Cloud is not the same as unlimited local Ollama. Cloud usage is governed by the Ollama account's included usage/credits and model pricing. Running a model on your own hardware remains the unlimited local option, subject to your hardware.
