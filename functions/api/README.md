# Margots search proxy

The public frontend calls `/api/search?q=...`. The Google credentials must be configured as server-side environment secrets named `GOOGLE_API_KEY` and `GOOGLE_CX` on the Pages/Functions provider.

Do not put these values in `docs/` or browser JavaScript.

This function is designed for Cloudflare Pages Functions. If the site remains on GitHub Pages, deploy the `functions/` directory to a Cloudflare Pages project using the same `docs/` output as the static site, or use another serverless host and point the frontend `/api/search` path to it.