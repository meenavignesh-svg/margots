# Margots

Browser-based bioinformatics analysis workspace. Local measurements run in-page; the same question is sent to three independent free-tier model backends so you can compare answers side by side.

**Live app:** https://meenavignesh-svg.github.io/margots/

## Features

### Analysis modes
- **Sequence** — DNA / RNA / protein with GC%, composition, Tm estimate, reverse complement, ORF scan, codon frequencies, translation preview
- **Variant** — free-text variant notes
- **Free** — any scientific context + question
- **Upload** — FASTA, FASTQ, CSV, TSV, VCF, BED, GFF, JSON, TXT (parsed locally)
- **Agent** — holographic chat agent that remembers last run, editor sequence, and uploaded file; speaks replies

### Workspace tools
- **Load example** / sample DNA · RNA · protein chips
- **History** — last 20 runs in localStorage, click to restore
- **Export** — JSON, text, or CSV of facts + answers
- **Share** — copy a URL hash that reloads the result
- **Copy all** — clipboard dump of the three answers
- **Automatic fallback** — if a preferred provider key is missing or fails, the next available free-tier key is used

### Model slots
| Slot | Preferred | Free key |
|------|-----------|----------|
| Strict | Google Gemini | https://aistudio.google.com/apikey |
| Context | Groq | https://console.groq.com/keys |
| Skeptic | OpenRouter | https://openrouter.ai/keys |

Keys are stored only in `localStorage`. One key is enough to run.

## Hosting

GitHub Pages from `docs/`.

- UI: `docs/index.html`
- Logic: `docs/app.js`

## Privacy

- Files are read in the browser only
- Model calls go directly to the providers with your keys
- No Margots backend
