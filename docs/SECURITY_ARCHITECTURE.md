# MARGOTS Security Architecture

## Production data flow

```text
USER DEVICE
    |
    | HTTPS
    v
MARGOTS PWA / WEB APP
    |
    | HTTPS JSON
    v
MARGOTS BACKEND (Flask)
    |
    | server-side SDK request
    v
PRIVATE AI API KEY
    |
    v
AI PROVIDER
    |
    v
MARGOTS BACKEND
    |
    v
MARGOTS PWA
```

**The AI API key is stored only on the backend and is never shipped with the MARGOTS application.**

## Secret boundary

The following must never be placed in `docs/`, the PWA manifest, JavaScript bundles, source maps, localStorage, sessionStorage, client-accessible cookies, or GitHub Pages configuration:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `XAI_API_KEY`
- Google search API credentials
- database credentials or deployment tokens

The browser receives only the public API base URL. Backend environment variables hold provider secrets.

## API controls

- JSON input validation and explicit analysis modes
- 10 MB HTTP request ceiling by default
- additional sequence/table/text size limits
- server-side rate limits
- configurable shared rate-limit storage through `RATELIMIT_STORAGE_URI`
- strict CORS allow-list through `ALLOWED_ORIGINS`
- provider timeouts
- safe provider error messages with secret redaction
- security response headers
- no uploaded file is executed
- HTTPS is required for production deployment

## Authentication

The current public research/education deployment is intentionally anonymous. Rate limiting and validation protect the public endpoint. A private/team deployment should add authenticated access and authorization before exposing sensitive datasets or high-cost AI execution.

## CSRF

The API is designed as a cross-origin JSON API rather than a browser-cookie authenticated application, and it does not rely on ambient authentication cookies. If cookie authentication is introduced, CSRF protection must be added before enabling it.

## Verification checklist

Before production release:

1. Search the repository and generated frontend output for `sk-`, provider credential patterns, `.env` contents and deployment secrets.
2. Inspect JavaScript bundles and source maps if a bundler is introduced.
3. Confirm `docs/config.js` contains only `API_BASE_URL`.
4. Confirm `/health` does not return secrets.
5. Confirm production CORS contains only trusted origins.
6. Confirm the backend is served through HTTPS.
7. Use a shared Redis-backed limiter for multiple backend instances.
8. Review dependencies regularly for known vulnerabilities.

## Scientific boundary

AI output is an interpretation layer, not experimental or clinical validation. Sensitive or regulated biological data should not be sent to an external AI provider unless the deployment, contracts and provider configuration have been independently approved for that data class.
