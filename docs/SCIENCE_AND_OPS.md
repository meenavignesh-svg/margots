# Margots — science, security, and operations

## Live demo

https://meenavignesh-svg.github.io/margots/

Hard-refresh after deploys. Sample data: `docs/samples/example.fasta`.

## Deterministic vs AI interpretation

| Layer | Label in UI | Meaning |
|-------|-------------|--------|
| **Deterministic** | `DETERMINISTIC FACTS` | GC%, base counts, reverse complement, translation preview, ORFs, Tm estimates — computed in-browser, reproducible |
| **Public literature** | `PUBLIC LITERATURE` | Europe PMC, OpenAlex, UniProt API hits with links |
| **AI interpretation** | `STRICT / CONTEXT / SKEPTIC` | Model-generated text. **Not experimental validation.** |

Never treat AI cards as lab results.

## API key storage

- Keys are stored **only** in the browser: `localStorage` keys `margots_gemini`, `margots_groq`, `margots_openrouter`.
- Margots has **no account server** for keys in the normal GitHub Pages flow.
- Clearing site data removes keys. Do not commit keys to git.

## CORS and provider failures

- LLM calls: **browser → Gemini / Groq / OpenRouter** directly.
- Literature calls: **browser → Europe PMC / OpenAlex / UniProt** (public, no key).
- Typical failures: invalid key, quota, offline network, corporate proxy, or provider HTTP errors.
- Agents fail **independently** — one provider can fail while others succeed.
- Optional Google Programmable Search uses the configured search path / proxy when enabled.

## Melting temperature formulas (references)

1. **Wallace (oligos ~14–20 nt)**  
   `Tm ≈ 2°C·(A+T) + 4°C·(G+C)`  
   Wallace RB et al. (1979) *Nucleic Acids Research* 6:3543–3557.

2. **Marmur–Doty style (longer DNA, rough)**  
   `Tm ≈ 81.5 + 16.6·log10([Na+]) + 0.41·(%GC) − 600/N` with `[Na+] = 0.1 M`  
   Marmur J & Doty P (1962) *J Mol Biol* 5:109–118.

These are **estimates** for teaching/demo use, not PCR protocol truth.

## Automated tests

```bash
node docs/tests/bio-core.test.js
```

Covers GC%, reverse complement, translation, ORF detection, FASTA parse, edge cases.

## Supported browsers

- Chrome / Edge 90+
- Firefox 90+
- Safari 15+
- Requires: ES2019+, `fetch`, `localStorage`, `FileReader`
- Voice input needs Web Speech API (Chromium best)

## Sample datasets

- `docs/samples/example.fasta` — ORF, GC-rich, AT-rich demos

## Known limitations

- Not a clinical or diagnostic device.
- ORF finder is a simple ATG→stop scan (min length configurable), not a full gene predictor.
- Tm formulas are classical approximations.
- Public APIs return metadata/abstracts available to the API — not paywalled full-text scraping.
- Multi-agent output can disagree; that is intentional.
- Large files capped (~8 MB) in the browser path.

## License

MIT — see `/LICENSE`.
