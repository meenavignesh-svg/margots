# Margots

Bioinformatics analysis tool that runs the same question through three different model backends and keeps the results separate so you can compare them.

**Live app:** https://meenavignesh-svg.github.io/margots/

Paste your own API keys in the browser (stored only in localStorage). Local sequence measurements run in-page; model calls go straight to the providers.

## Local (Python) setup

```bash
pip install -r requirements.txt
cp .env.example .env
```

Fill in the three keys in `.env`:

```
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
XAI_API_KEY=
```

Then:

```bash
streamlit run app.py
```

## Notes

- Sequence mode: GC%, composition, translation attempt, protein params when relevant
- Expression mode (Python app): accepts CSV/TSV, shows basic describe + null counts
- Variant and free-text modes pass the text through
- Each backend gets a different system prompt (strict / contextual / skeptical)
- Results are shown side by side, not merged
