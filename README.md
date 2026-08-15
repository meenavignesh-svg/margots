# Margots

Browser-based bioinformatics analysis workspace. Local measurements run in-page; the same question is sent to three independent free-tier model backends so you can compare answers side by side.

**Live app:** https://meenavignesh-svg.github.io/margots/

## Features

- **Sequence** — DNA / RNA / protein paste with GC%, composition, length
- **Variant** — free-text variant notes
- **Free** — any scientific context + question
- **Upload** — FASTA, FASTQ, CSV, TSV, VCF, BED, GFF, JSON, TXT, and other text formats (read locally in the browser)
- **Agent** — chat with a holographic agent that replies by voice
- Three parallel answers: **Strict · Gemini**, **Context · Groq**, **Skeptic · OpenRouter**

## API keys (free tiers)

Keys are entered in the app (top right) and stored only in `localStorage`.

| Slot | Provider | Get a key |
|------|----------|-----------|
| Strict | Google Gemini | https://aistudio.google.com/apikey |
| Context | Groq | https://console.groq.com/keys |
| Skeptic | OpenRouter | https://openrouter.ai/keys |

No credit card is required for the basic free tiers of these providers. Rate limits apply per account.

## Hosting

Static site on GitHub Pages from the `docs/` folder.

Source of the app: `docs/index.html`

## Privacy

- Uploaded files are parsed in the browser; they are not uploaded to a Margots server
- Model calls go directly from your browser to the provider APIs using your keys
- Keys never leave your machine except as Authorization headers to those APIs
