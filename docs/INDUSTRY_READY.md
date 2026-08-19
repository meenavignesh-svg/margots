# Margots — industry readiness

**Live:** https://meenavignesh-svg.github.io/margots/

## What “industry-ready” means here

Margots is positioned as **research / education / R&D software**, not a clinical diagnostic or regulated medical device.

| Requirement | Status |
|-------------|--------|
| Deterministic calculations separated from AI text | Done |
| Automated tests for core bio metrics | Done (`npm test`) |
| CI on push/PR | Done (`.github/workflows/test-bio-core.yml`) |
| Stable production UI (no auto-overwrite bots) | Done (inject workflows disabled) |
| Public literature APIs (no scrape of paywalled full text) | Done |
| Keys only in browser `localStorage` | Done |
| License (MIT) | Done |
| Scientific formula references | Done (`docs/SCIENCE_AND_OPS.md`) |
| Known limitations documented | Done |
| Non-medical disclaimer in UI | Done |

## Not claimed

- FDA / CE / IVD certification
- Clinical decision support
- 100% uptime SLA from third-party LLM or literature APIs
- Replacement for BLAST, Galaxy, or commercial LIMS

## Run checks

```bash
npm test
npm run serve   # http://localhost:8000
```

## Architecture (production path)

```text
docs/index.html          → UI shell (single source of truth)
docs/bio-core.js         → deterministic sequence engine
docs/literature.js       → Europe PMC / OpenAlex / UniProt
docs/unified-app.js      → orchestration, keys, chat
docs/google-search.js    → optional Google CSE config
```

Legacy files under `docs/` (goat-ui, jarvis-*, chatgpt-layout) are **not** part of the production load path.
