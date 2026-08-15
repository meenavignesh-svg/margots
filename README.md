# BioOmni AI

**The Ultimate Multi-LLM Bioinformatics Data Analysis Engine**

BioOmni AI is a production-grade platform that can perform virtually any bioinformatics data analysis task by combining classical computational biology tools with three frontier large language models.

## Supported Analysis Types

- Sequence analysis (DNA, RNA, protein)
- Multiple sequence alignment interpretation
- Variant effect prediction & clinical interpretation
- Differential expression analysis
- Pathway & enrichment analysis
- Structural biology insights
- Single-cell data interpretation
- Metagenomics summary
- Custom multi-omics integration
- Literature-aware hypothesis generation

## Architecture

BioOmni uses **three API keys** simultaneously:

1. **OpenAI** (GPT-4o / o-series)
2. **Anthropic** (Claude 4 / Sonnet)
3. **xAI** (Grok)

The system can route queries intelligently, run parallel analyses, or create consensus answers across models for higher reliability.

## Quick Start

```bash
git clone https://github.com/meenavignesh-svg/margots.git
cd margots
pip install -r requirements.txt
cp .env.example .env
# Add your three API keys to .env
streamlit run app.py
```

## Environment Variables

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...
```

## Philosophy

Built as the greatest bioinformatics AI analysis tool possible — combining rigorous scientific computation with the reasoning power of multiple frontier models.

---

**Margots Project** • Built by Meena Vignesh M. + Grok