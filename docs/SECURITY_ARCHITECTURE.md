# MARGOTS Security Architecture

## Primary production data flow: BYOK

```text
USER DEVICE
    |
    | enters their own provider API key
    v
MARGOTS PWA / WEB APP
    |
    | key exists only in JavaScript memory
    |
    | HTTPS request authenticated with user's key
    v
AI PROVIDER
    |
    | response
    v
MARGOTS PWA / WEB APP
```

The user's provider API key is **never sent to the MARGOTS backend**. It is held only in runtime memory for the current page/app session. Reloading or closing the page clears the in-memory value.

## What MARGOTS does not do with the user's key

MARGOTS does not:

- store the key in `localStorage`
- store the key in `sessionStorage`
- store the key in IndexedDB
- put the key in cookies
- put the key in URLs or query parameters
- send the key to the MARGOTS backend
- write the key to GitHub
- write the key to application files
- log the key
- include the key in analytics or telemetry
- cache the key in the service worker

The API-key input uses `autocomplete="off"`, and the key is cleared from the input immediately after it is loaded into the runtime session object.

## Important browser security boundary

BYOK means the browser must possess the key because it authenticates the direct provider request. A browser user or browser developer tools can therefore inspect their own key while it is being used. MARGOTS cannot guarantee that a key is invisible to the device owner.

MARGOTS **can** guarantee by application design that the key is not intentionally persisted or routed through MARGOTS infrastructure.

Provider browser/CORS policy also applies. If a provider does not permit direct browser requests, that provider cannot be used through this direct-BYOK path without introducing a server-side relay—which would violate this application's session-only direct-key requirement.

## Deterministic backend flow

Deterministic bioinformatics operations can still use the optional MARGOTS backend:

```text
USER DEVICE → MARGOTS PWA → HTTPS → MARGOTS BACKEND → deterministic analysis → PWA
```

No provider key is included in these backend requests.

## API controls

The MARGOTS backend retains its independent protections for deterministic/public endpoints:

- JSON input validation and explicit analysis modes
- request-body limits
- sequence/table/text size limits
- server-side rate limits
- configurable shared rate-limit storage through `RATELIMIT_STORAGE_URI`
- strict CORS allow-list
- request timeouts
- safe error messages
- security response headers
- no uploaded file execution
- HTTPS for production deployment

## Repository secret rules

The repository may contain `.env.example` placeholders and server-side compatibility configuration, but must never contain real credentials. CI should scan frontend output for provider-key patterns before deployment.

## Verification checklist

Before production release:

1. Search `docs/` and any generated frontend output for provider-key patterns.
2. Confirm no code writes provider keys to browser storage APIs.
3. Confirm no API-key value is appended to URLs, logs, analytics, or backend requests.
4. Inspect browser Network requests and verify the MARGOTS backend never receives the provider key.
5. Confirm `docs/config.js` contains only public configuration.
6. Confirm the service worker never caches API-key data.
7. Confirm production pages use HTTPS.
8. Test clearing/reloading the page and verify the key is no longer loaded.

## Scientific boundary

AI output is an interpretation layer, not experimental or clinical validation. Sensitive or regulated biological data should not be sent to an external AI provider unless the user and deployment are independently authorized to do so.
