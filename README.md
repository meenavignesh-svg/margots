# Margots

Bioinformatics analysis tool that runs the same question through three different model backends and keeps the results separate so you can compare them.

It also does basic sequence stats and table summaries with Biopython / pandas before anything is sent to a model.

**Site:** https://meenavignesh-svg.github.io/margots/

## Setup

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
- Expression mode: accepts CSV/TSV, shows basic describe + null counts
- Variant and free-text modes just pass the text through
- Each backend gets a different system prompt on purpose (strict / contextual / skeptical)
- Results are shown side by side, not merged
