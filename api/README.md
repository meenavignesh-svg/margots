# Margots API

The API gateway keeps provider credentials off the public frontend.

## Environment variables

`GOOGLE_SEARCH_API_KEY` — Google Programmable Search JSON API key.

`GOOGLE_SEARCH_ENGINE_ID` — Programmable Search Engine ID.

Set these as deployment secrets/environment variables. Never commit real keys to Git.

## Endpoint

`POST /api` with JSON `{ "action": "search", "query": "your query" }`.

The gateway returns normalized search results. If Google credentials are not configured, it returns a clear configuration error instead of exposing or requesting a client-side secret.
