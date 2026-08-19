<div align="center">

# 🧬 MARGOTS
### **Multi-Agent Molecular Intelligence**

**A browser-first bioinformatics workspace combining deterministic sequence analysis with independent AI-assisted reasoning.**

<a href="https://meenavignesh-svg.github.io/margots/"><img src="https://img.shields.io/badge/🚀_LIVE_APP-Launch_MARGOTS-00d9ff?style=for-the-badge&labelColor=07111f"/></a>
<a href="https://github.com/meenavignesh-svg/margots"><img src="https://img.shields.io/badge/⭐_GITHUB-Repository-111827?style=for-the-badge&logo=github&logoColor=white"/></a>
<a href="https://github.com/meenavignesh-svg/margots/issues"><img src="https://img.shields.io/badge/🐛_ISSUES-Report_or_Discuss-d73a4a?style=for-the-badge&logo=github&logoColor=white"/></a>

![Status](https://img.shields.io/badge/status-active_development-f59e0b?style=for-the-badge)
![License](https://img.shields.io/github/license/meenavignesh-svg/margots?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/meenavignesh-svg/margots?style=for-the-badge&logo=github)

</div>

---

## 🎯 Product Vision

MARGOTS is an **experimental scientific software platform** for exploring how deterministic bioinformatics calculations and multiple AI perspectives can coexist in one researcher-oriented workspace.

The central design principle is simple:

> **Calculate what can be calculated. Ask AI what requires interpretation. Keep the human in the loop.**

MARGOTS is intentionally **not positioned as a clinical diagnostic system or a replacement for experimental validation**.

---

## 🧬 What It Does

### Deterministic bioinformatics

MARGOTS performs local, reproducible operations on biological sequence input, including:

- DNA / RNA / protein handling
- nucleotide and amino-acid composition
- GC percentage
- melting-temperature estimation
- reverse complement
- translation preview
- ORF scanning
- codon-frequency analysis
- biological file parsing

### AI-assisted reasoning

The same scientific context can be supplied to multiple independently configured model slots. Their responses can then be compared rather than treating a single model output as authoritative.

```text
                 BIOLOGICAL INPUT
                        │
                        ▼
              VALIDATE + NORMALIZE
                        │
                        ▼
             DETERMINISTIC ANALYSIS
                        │
                        ▼
               SCIENTIFIC CONTEXT
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       MODEL A       MODEL B       MODEL C
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                COMPARE + REVIEW
                        │
                        ▼
               HUMAN INTERPRETATION
```

---

## 🏗️ Architecture

MARGOTS follows a **separation-of-concerns** approach:

| Layer | Responsibility |
|---|---|
| **Input layer** | Parse, normalize and validate biological input |
| **Bioinformatics core** | Deterministic sequence calculations |
| **Context layer** | Build structured scientific context |
| **Provider layer** | Communicate with configured AI providers |
| **Comparison layer** | Present independent model outputs side-by-side |
| **Workspace layer** | History, export, sharing and UI state |
| **Presentation layer** | Responsive scientific interface and visualization |

See the full [architecture document](docs/ARCHITECTURE.md).

---

## 🔬 Supported Workflows

| Workflow | Purpose |
|---|---|
| 🧬 **Sequence** | Analyze DNA, RNA and protein sequences |
| 🧪 **Variant** | Explore free-form variant descriptions with AI assistance |
| 📁 **Upload** | Work with FASTA, FASTQ, CSV, TSV, VCF, BED, GFF, JSON and TXT inputs |
| 🧠 **Agent** | Interact with the current scientific workspace context |
| 💬 **Free** | Ask general scientific questions within the workspace |

### Scientific input boundary

MARGOTS should be used for **research, education and exploratory analysis**. It must not be represented as clinical decision support, a diagnostic system, or experimental confirmation.

---

## 🔐 Privacy & Security by Design

MARGOTS is designed around a **browser-first architecture**:

- Local sequence calculations run in the browser.
- Uploaded files are processed client-side in the normal workflow.
- Provider credentials are supplied by the user and are not intended to be committed to the repository.
- AI requests go to the configured third-party provider.
- MARGOTS does not require a central analysis database for its normal static deployment.

### ⚠️ Sensitive data

Do **not** submit patient-identifiable information, protected health information, confidential research data, proprietary sequences, or other sensitive biological data unless you have independently verified that the deployment and selected third-party providers are authorized for that data.

Never commit API keys to GitHub. Use `.env.example` as a template only.

See [SECURITY.md](SECURITY.md).

---

## 🤖 AI Provider Model

Provider availability and model IDs change over time. MARGOTS therefore treats provider/model configuration as replaceable rather than hard-coding a permanent model assumption.

Possible provider integrations include configured model APIs such as:

- Google Gemini
- Groq
- OpenRouter
- Other compatible providers supported by the current implementation

**AI responses are advisory outputs.** Always verify scientific claims against primary literature, validated databases and appropriate domain expertise.

---

## 🚀 Run Locally

```bash
git clone https://github.com/meenavignesh-svg/margots.git
cd margots
python -m http.server 8000 --directory docs
```

Open:

```text
http://localhost:8000
```

A local HTTP server is recommended instead of opening `index.html` directly with `file://`.

---

## 📂 Repository Structure

```text
margots/
├── .github/workflows/      # CI, deployment and security automation
├── api/                    # Optional API/server components
├── core/                   # Deterministic + provider-oriented Python core
├── docs/                   # Browser application and scientific UI
├── samples/                # Example biological inputs
├── .env.example            # Configuration template — no secrets
├── ABOUT.md                # Project background
├── ARCHITECTURE.md         # System design
├── CHANGELOG.md            # Release history
├── CONTRIBUTING.md         # Engineering contribution rules
├── SECURITY.md             # Security policy
├── CODE_OF_CONDUCT.md      # Community standards
└── README.md
```

---

## 🧪 Engineering Standards

MARGOTS is being developed toward stronger software and scientific engineering practices:

- deterministic calculations separated from AI reasoning
- explicit input validation
- provider isolation
- security scanning in CI
- documented data boundaries
- reproducible workflows
- accessibility and reduced-motion support
- focused contributions
- scientific caveats around AI-generated interpretation

The project is still in **active development**. “Industry-ready” is a direction and engineering standard—not a claim that the current system has been validated for regulated clinical or production laboratory use.

---

## 🗺️ Roadmap

### Foundation

- [x] Browser-native sequence workspace
- [x] Local sequence calculations
- [x] Multi-provider AI comparison
- [x] File upload/parsing workflows
- [x] History, export and share utilities
- [x] Responsive scientific UI
- [x] Security workflow

### Next engineering milestones

- [ ] Automated unit tests for deterministic bioinformatics calculations
- [ ] Input validation test suite across supported formats
- [ ] Provider adapter contract tests
- [ ] Stronger model-output provenance and disagreement visualization
- [ ] Reproducible analysis/report generation
- [ ] Expanded sequence-quality diagnostics
- [ ] Performance monitoring for large inputs
- [ ] Accessibility audit and automated checks
- [ ] Release/versioning discipline
- [ ] Recorded product demonstration

### Long-term research direction

- [ ] More deterministic bioinformatics modules
- [ ] Richer biological visualization
- [ ] Literature-backed evidence workflows
- [ ] Reproducible computational research reports
- [ ] Extensible provider/plugin architecture

---

## 🤝 Contributing

Contributions, ideas and careful scientific feedback are welcome.

Before opening a PR:

1. Test the affected workflow.
2. Check browser console errors.
3. Test invalid and empty biological input.
4. Verify provider failures produce safe, understandable states.
5. Confirm no secrets or private data were introduced.
6. Document changes affecting scientific interpretation.

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📜 License

See [LICENSE](LICENSE) for the applicable terms.

---

<div align="center">

### 🧬 **MARGOTS**

**Measure locally. Reason independently. Review scientifically.**

<a href="https://meenavignesh-svg.github.io/margots/"><img src="https://img.shields.io/badge/🚀_LAUNCH_MARGOTS-00d9ff?style=for-the-badge&labelColor=07111f"/></a>

</div>
