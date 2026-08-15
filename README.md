# Margots

A biological reasoning lattice.

Margots does not wrap language models around bioinformatics tasks.  
It treats every analysis as a process of hypothesis generation, selective pressure, and refinement — the same logic evolution uses.

Three independent reasoning cores operate under different selection criteria:

- **Precision core** — statistical and structural rigor
- **Context core** — biological systems and literature patterns
- **Divergence core** — alternative explanations and edge cases

Their outputs are not averaged. They are placed under selective pressure. Only claims that survive cross-examination are retained.

---

### What it actually does

- Decomposes a biological question into testable atomic claims
- Runs classical sequence / statistical computation first (no model involved)
- Forces each core to defend or abandon its position
- Surfaces unresolved conflicts instead of hiding them
- Returns structured biological assertions with explicit confidence boundaries

This is not a chatbot with Biopython.  
It is a reasoning engine that happens to operate on biological data.

---

### Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# supply the three keys
streamlit run app.py
```

---

Margots rejects the default pattern of “prompt → answer”.  
It only keeps what can survive disagreement.