# Margots hardening checklist

## Evidence
- Keep deterministic sequence facts separate from AI interpretation.
- Preserve source title + URL and, where supplied by a connector, DOI/PMID/accession identifiers.
- Never present an AI response as experimental validation.

## Research connectors
The browser registry uses keyless public endpoints where providers permit it. Provider terms, rate limits and availability still apply.

## API credentials
- Never commit provider keys.
- Browser-stored keys are user-owned credentials and remain in localStorage in the current client architecture.
- For production, prefer a server-side proxy with environment/secret-manager storage and per-provider rate limits.

## Testing
Use the in-app **Diagnostics** panel for browser capability checks. The repository security workflow runs `tools/security_scan.py` on pushes and pull requests.

## Deployment
GitHub Pages serves the static client. Server-only `/api/*` routes require a separate backend deployment; the browser fallback should not be mistaken for a secure server proxy.
