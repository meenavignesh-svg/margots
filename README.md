<div align="center">

# 🧬 M A R G O T S

### **MULTI-AGENT MOLECULAR INTELLIGENCE**

**A browser-native bioinformatics workspace where sequence analysis meets independent AI reasoning.**

<br>

[![Live App](https://img.shields.io/badge/🚀_LIVE_APP-Margots-00d9ff?style=for-the-badge&labelColor=07111f)](https://meenavignesh-svg.github.io/margots/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-111827?style=for-the-badge&logo=github)](https://github.com/meenavignesh-svg/margots)

</div>

---

## 🎬 WATCH MARGOTS THINK

<div align="center">

> **DNA enters → molecular facts are extracted → independent AI agents reason → answers can be compared side-by-side.**

<!-- Replace this local asset with the final recorded demo when available. -->
<img src="docs/margots-demo.gif" alt="Margots animated product demo" width="920" />

**Interactive 3D biotech interface · AI-agent visualization · sequence intelligence**

</div>

> **Demo asset:** `docs/margots-demo.gif` is the intended local README showcase. If the GIF has not yet been generated, the rest of this README remains fully functional; add the recording to that path when ready.

---

## 🧠 WHAT IS MARGOTS?

**Margots** is a browser-based scientific analysis workspace designed to combine deterministic bioinformatics calculations with independent AI perspectives.

Instead of asking one model for an answer and accepting it blindly, Margots can send the same scientific question to multiple model slots and present their responses independently so the researcher can compare reasoning, disagreements, and conclusions.

### The idea

```text
                    ┌─────────────────────┐
                    │     🧬 INPUT         │
                    │ DNA / RNA / PROTEIN  │
                    │ VARIANT / FILE / Q   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  🔬 LOCAL ANALYSIS   │
                    │ Facts • GC% • Tm     │
                    │ ORFs • composition   │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
        🧠 STRICT          🧠 CONTEXT        🧠 SKEPTIC
        Gemini              Groq             OpenRouter
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   ⚡ COMPARE         │
                    │ Independent answers │
                    │ + scientific facts  │
                    └─────────────────────┘
```

---

## ✨ CORE CAPABILITIES

| Capability | What Margots does |
|---|---|
| 🧬 **Sequence intelligence** | DNA, RNA and protein analysis directly in the browser |
| 🧪 **Molecular facts** | GC%, composition, Tm estimate, reverse complement and translation preview |
| 🔎 **ORF analysis** | Detects candidate open reading frames and summarizes sequence features |
| 🧠 **Multi-agent reasoning** | Sends the same question to independent model slots for comparison |
| 📁 **File workspace** | FASTA, FASTQ, CSV, TSV, VCF, BED, GFF, JSON and TXT parsing |
| 🤖 **Agent mode** | Interactive holographic assistant with workspace memory |
| 🕘 **History** | Keeps recent runs locally for quick restoration |
| 📤 **Export** | JSON, text and CSV exports |
| 🔗 **Share** | Shareable result state through a URL hash |
| 🔐 **Browser-first privacy** | No Margots backend; files are processed locally |

---

## 🧬 ANALYSIS MODES

### Sequence

Analyse DNA, RNA or protein sequences and obtain deterministic measurements such as:

- GC percentage
- nucleotide/amino-acid composition
- melting-temperature estimate
- reverse complement
- ORF scan
- codon frequencies
- translation preview

### Variant

Use free-form variant descriptions and scientific context for AI-assisted interpretation.

### Free

Ask Margots any scientific question without restricting the workspace to a sequence.

### Upload

Bring structured or text-based biological data into the workspace:

`FASTA` · `FASTQ` · `CSV` · `TSV` · `VCF` · `BED` · `GFF` · `JSON` · `TXT`

### Agent

Enter the holographic agent workspace. The agent can work with the current run, editor sequence and uploaded-file context.

---

## 🤖 THE THREE-PERSPECTIVE MODEL

Margots is designed around **independent model slots**, not one monolithic answer.

| Slot | Preferred backend | Purpose |
|---|---|---|
| 🧠 **Strict** | Google Gemini | Structured, evidence-oriented reasoning |
| 🧠 **Context** | Groq | Fast contextual analysis |
| 🧠 **Skeptic** | OpenRouter | Alternative model perspective / challenge |

Provider availability can change. Configure currently supported model IDs and API keys in the application rather than assuming a provider will always expose a particular model.

### API key sources

- [Google AI Studio](https://aistudio.google.com/apikey)
- [Groq Console](https://console.groq.com/keys)
- [OpenRouter](https://openrouter.ai/keys)

> **Security:** Never commit API keys to GitHub. Margots is designed so provider credentials remain on the user's browser side rather than being stored by a Margots server.

---

## 🌌 THE INTERFACE

The frontend is deliberately built as a futuristic scientific workspace rather than a conventional form:

- 3D/parallax depth effects
- animated molecular/biotech visuals
- holographic agent core
- scanning and analysis states
- glass-style information panels
- responsive layouts
- reduced-motion accessibility support

The visual layer is separated from the scientific engine so the interface can evolve without rewriting the underlying analysis logic.

---

## ⚙️ RUN LOCALLY

Clone the repository:

```bash
git clone https://github.com/meenavignesh-svg/margots.git
cd margots
```

Because the primary interface is browser-native, you can serve `docs/` with any static HTTP server. For example:

```bash
python -m http.server 8000 --directory docs
```

Then open:

```text
http://localhost:8000
```

> Opening files directly with `file://` can cause browser restrictions for some features. A local HTTP server is recommended.

---

## 🏗️ PROJECT STRUCTURE

```text
margots/
├── docs/
│   ├── index.html       # Main application shell
│   ├── app.js           # Workspace + analysis logic
│   ├── goat-ui.js       # Enhanced visual interaction layer
│   └── margots-demo.gif # README showcase asset (when generated)
├── .github/
│   └── workflows/       # GitHub Pages / UI automation
├── README.md
└── ...
```

---

## 🔬 SCIENTIFIC WORKFLOW

```text
INPUT
  ↓
Normalize + validate
  ↓
Classify biological material
  ↓
Deterministic local measurements
  ↓
Build scientific context
  ↓
Independent AI analysis
  ↓
Compare responses
  ↓
Human interpretation
```

### Important scientific principle

**AI output is not experimental validation.** Margots is an analysis and reasoning workspace. Results should be checked against primary literature, validated databases, experimental evidence and appropriate laboratory procedures before being used for scientific or clinical decisions.

---

## 🔐 PRIVACY MODEL

Margots is intentionally browser-first:

- 📄 Uploaded files are read in the browser.
- 🧬 Local sequence measurements run in-page.
- 🔑 Provider API keys are held client-side.
- 🌐 Model requests go directly to the configured provider.
- 🖥️ There is no Margots analysis backend in the normal browser workflow.

Always review the privacy/data-retention policies of any external AI provider before submitting sensitive or proprietary biological information.

---

## 🚀 LIVE

<div align="center">

### **Enter the molecular workspace.**

[![Launch Margots](https://img.shields.io/badge/🧬_LAUNCH_MARGOTS-00d9ff?style=for-the-badge&labelColor=07111f)](https://meenavignesh-svg.github.io/margots/)

</div>

---

## 🧭 ROADMAP

- [x] Browser-native sequence workspace
- [x] Multi-provider AI comparison
- [x] Upload + local parsing
- [x] History / export / share tools
- [x] Holographic agent interface
- [x] Enhanced 3D visual layer
- [ ] Recorded cinematic product demo
- [ ] Expanded sequence-quality diagnostics
- [ ] Richer visualization of model disagreement
- [ ] More deterministic bioinformatics modules
- [ ] Reproducible analysis/report generation

---

## 🤝 CONTRIBUTING

Ideas, bug reports and improvements are welcome.

1. Fork the repository.
2. Create a focused feature branch.
3. Keep scientific calculations deterministic and testable.
4. Avoid committing credentials or private biological data.
5. Document changes that affect scientific interpretation.
6. Open a pull request with a clear description of the change.

---

## 📜 LICENSE

See the repository's license files for the applicable licensing terms.

---

<div align="center">

**🧬 Margots — make the biology measurable, make the reasoning comparable.**

Built with curiosity, code, and biotechnology.

</div>
