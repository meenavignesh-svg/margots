<div align="center">

# 🧬 MARGOTS
### **AI-Native Genomic Workflow & Bioinformatics Automation Platform**

**Turn sequencing data and experimental intent into reproducible bioinformatics workflows, automated analysis, quality control, and scientific reports — from one workspace.**

<a href="https://meenavignesh-svg.github.io/margots/"><img src="https://img.shields.io/badge/🚀_LIVE_APP-Launch_MARGOTS-10a37f?style=for-the-badge"/></a>
<a href="https://github.com/meenavignesh-svg/margots"><img src="https://img.shields.io/badge/⭐_GITHUB-Repository-111827?style=for-the-badge&logo=github&logoColor=white"/></a>

![Status](https://img.shields.io/badge/status-active_development-f59e0b?style=for-the-badge)
![License](https://img.shields.io/github/license/meenavignesh-svg/margots?style=for-the-badge)

</div>

---

## 🚀 What is MARGOTS?

MARGOTS is being built as an **AI-native bioinformatics automation workspace** for researchers, biotechnology students, computational biologists and early-stage biotech teams.

Instead of forcing scientists to manually assemble commands, search documentation, debug pipelines and move between disconnected tools, MARGOTS aims to turn a scientific request into a structured computational workflow.

### The core idea

```text
Experimental Intent / Biological Data
              ↓
        Understand the task
              ↓
       Validate the inputs
              ↓
   ┌──────────┼──────────┐
   ↓          ↓          ↓
   QC      Workflow    Literature
   ↓       Planning       ↓
   └──────────┼──────────┘
              ↓
     Pipeline Generation
              ↓
     Optimize + Validate
              ↓
       Execute / Analyze
              ↓
   Results + Visualizations
              ↓
   Reproducible Scientific Report
```

**The goal is not simply to make an AI chatbot for biology. The goal is to make bioinformatics workflows dramatically easier to create, inspect, reproduce and operate.**

> **Describe the experiment. Upload the data. MARGOTS builds the computational path.**

MARGOTS is a research and educational platform in active development. Automated outputs require scientific review and do not replace validated clinical, diagnostic or experimental workflows.

---

## 🧬 The Problem

Modern sequencing creates enormous computational workloads, but many researchers still have to manually combine:

- command-line bioinformatics tools
- workflow managers such as Nextflow or Snakemake
- reference genomes and annotation resources
- quality-control programs
- literature searches
- scripting and data wrangling
- visualization tools
- debugging and environment management

A small change in an input, reference, parameter or tool version can require substantial troubleshooting.

MARGOTS is designed to make this process **conversational, structured and reproducible**.

---

## 🤖 AI-Native Workflow Generation

A scientist should eventually be able to write:

> **“Analyze this RNA-seq experiment, check quality, quantify expression, identify differentially expressed genes and generate publication-ready plots.”**

MARGOTS can then construct a proposed workflow containing:

1. input validation
2. quality-control steps
3. preprocessing
4. reference/database selection
5. analysis tools
6. parameters
7. expected outputs
8. visualization steps
9. provenance information
10. reproducible execution configuration

The generated workflow should remain **inspectable and editable** rather than being an opaque AI action.

---

## 🧪 Initial Workflow Targets

### RNA-seq
- FASTQ validation
- quality-control planning
- trimming/preprocessing
- alignment or pseudo-alignment planning
- transcript/gene quantification
- differential-expression workflow generation
- QC and visualization

### Variant analysis
- FASTQ/BAM/VCF input validation
- reference selection
- alignment and preprocessing planning
- variant-calling workflow generation
- filtering and annotation planning
- report generation

### Other planned workflows
- ChIP-seq
- ATAC-seq
- single-cell RNA-seq
- metagenomics
- amplicon analysis
- genome annotation
- comparative genomics
- protein/sequence analysis

Workflow availability depends on the current implementation; the roadmap describes the intended platform direction rather than claiming every workflow is production-ready today.

---

## 📊 From Raw Data to Scientific Output

MARGOTS is designed around a complete pipeline rather than a single AI response:

**Input → QC → Analysis → Interpretation → Visualization → Report**

Future outputs include:

- quality-control dashboards
- coverage summaries
- expression matrices
- variant reports
- differential-expression tables
- sequence statistics
- interactive plots
- workflow files
- parameter manifests
- provenance records
- publication-ready report packages

---

## 🧠 Multi-Agent Scientific Reasoning

MARGOTS separates deterministic computation from probabilistic interpretation.

```text
              Scientific Question
                      ↓
               Task Planner
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
   Bioinformatics   Literature    QC / Data
      Agent           Agent         Agent
        ↓             ↓             ↓
        └─────────────┼─────────────┘
                      ↓
               Evidence Layer
                      ↓
             Workflow Generator
                      ↓
            Validation / Review
                      ↓
             Human Approval
```

AI should propose, explain and optimize. **Deterministic software should calculate wherever possible.**

---

## 🔬 Who Is MARGOTS For?

| Audience | Value |
|---|---|
| 🧑‍🎓 Biotechnology students | Learn real bioinformatics workflows without unnecessary setup friction |
| 🧬 Bioinformatics learners | Generate, inspect and understand computational pipelines |
| 🔬 Academic researchers | Prototype analyses and automate repetitive computational work |
| 🧪 Biotech startups | Reduce engineering overhead for exploratory pipelines |
| 💻 Bioinformatics developers | Generate reproducible workflow scaffolding and tests |
| 🏥 Regulated organizations | Future controlled deployments with appropriate validation and compliance |

---

## 💰 Product Model

MARGOTS is designed around a **usage-based SaaS + team/enterprise model**.

### Free / Student
- basic sequence analysis
- small-file QC
- educational workflows
- limited workflow generation

### Pro
- advanced workflow generation
- larger analysis jobs
- reusable pipelines
- richer reports and visualizations
- increased compute allowance

### Team / Enterprise
- private deployments
- controlled data environments
- organization-wide workflow templates
- API access
- audit/provenance features
- custom compute routing
- priority support

**Clinical and regulated use would require separate validation, security controls, contractual requirements and regulatory review.**

---

## 🏗️ Architecture Direction

```text
┌─────────────────────────────────────────┐
│             MARGOTS WORKSPACE           │
│  Chat · Files · Workflow · Results · QC │
└────────────────────┬────────────────────┘
                     ↓
              Task Orchestrator
                     ↓
        ┌────────────┼────────────┐
        ↓            ↓            ↓
   Bio Agents    Search/Data   Workflow
        ↓            ↓            ↓
        └────────────┼────────────┘
                     ↓
             Validation Layer
                     ↓
        Nextflow / Snakemake / Python
                     ↓
              Compute Backend
                     ↓
          Results + Provenance
                     ↓
            Reports / Charts
```

The current repository contains browser-native sequence functionality, AI-provider integrations and an API gateway foundation. Cloud pipeline execution is a **development target**, not a claim that every workflow is currently production-executable.

---

## 🔐 Security & Scientific Boundaries

- Never commit API keys or credentials.
- Provider secrets belong in server-side deployment environments.
- Validate uploaded biological files before processing.
- Keep provenance for generated workflows and parameters.
- Treat AI-generated workflow suggestions as proposals requiring review.
- Do not submit patient-identifiable or confidential data to providers without appropriate authorization.
- Clinical use requires independent validation and applicable regulatory controls.

---

## 📱 Installable MARGOTS PWA

MARGOTS now includes an installable Progressive Web App shell for modern browsers.

### Android
Open the HTTPS MARGOTS site in Chrome and choose **Install app** or **Add to Home screen**.

### iPhone / iPad
Open MARGOTS in Safari → **Share** → **Add to Home Screen**. This is Safari PWA installation, not an App Store native application.

### Windows / macOS / Linux
Use a browser with PWA installation support and choose **Install MARGOTS** / **Install app** when offered.

The PWA caches the application shell for offline navigation. Server-backed AI and analysis require connectivity and are never falsely simulated offline.

See [`docs/INSTALL.md`](docs/INSTALL.md) for the complete installation guide.

---

## 🔒 AI API Secret Architecture

The normal user does **not** enter an AI API key. The browser only knows the public MARGOTS API endpoint.

```text
User device
    ↓ HTTPS
MARGOTS PWA
    ↓ HTTPS JSON
MARGOTS Flask backend
    ↓ server-side SDK
Private AI API key
    ↓
AI provider
    ↓
MARGOTS backend
    ↓ HTTPS JSON
MARGOTS PWA
```

**The AI API key is stored only on the backend and is never shipped with the MARGOTS application.**

Provider keys are read from backend environment variables such as `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `XAI_API_KEY`. They are not stored in HTML, JavaScript, CSS, PWA assets, localStorage, sessionStorage, or the GitHub Pages build.

See [`docs/SECURITY_ARCHITECTURE.md`](docs/SECURITY_ARCHITECTURE.md).

---

## 🛠️ Developer Setup

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python backend.py
```

In another terminal:

```bash
python -m http.server 8080 --directory docs
```

For local frontend-to-backend use, set `docs/config.js` to the local API URL. Production Pages configuration is injected by GitHub Actions through the public `MARGOTS_API_BASE_URL` repository/environment variable.

Optional AI providers are configured only on the backend using a matching API key and model name. The deterministic bioinformatics layer works without an AI provider.

### Tests

```bash
pytest -q tests
node docs/tests/bio-core.test.js
python -m compileall app.py backend.py core tools
```

### Backend API

- `GET /health`
- `POST /api/analyze`
- `POST /api/search`

Responses use a consistent `{success, data, error}` contract. The API applies validation, request limits, CORS restrictions, provider timeouts, rate limits and safe error handling.

---

## 🚀 Deployment

**Frontend:** GitHub Pages/static HTTPS hosting.

**Backend:** a real Python service such as Render, container hosting, or another HTTPS-capable platform. GitHub Pages cannot execute the Python backend.

Production backend configuration should include:

```text
ENVIRONMENT=production
ALLOWED_ORIGINS=https://meenavignesh-svg.github.io
OPENAI_API_KEY=<server secret if used>
OPENAI_MODEL=<server model>
```

For multiple backend instances, configure `RATELIMIT_STORAGE_URI` with shared Redis storage. Never place provider secrets in GitHub Pages configuration.

See [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 🗺️ Roadmap

### Foundation

- [x] Unified scientific chat workspace
- [x] Browser-native sequence analysis
- [x] Biological file handling
- [x] Multi-provider AI architecture
- [x] Search API gateway foundation
- [x] Responsive scientific interface
- [x] Installable PWA shell
- [x] Offline application-shell caching
- [x] Server-side secret boundary
- [x] Backend rate limiting and validation

### Automation

- [ ] Workflow planner agent
- [ ] FASTQ/FASTQ.GZ validation and QC engine
- [ ] Nextflow workflow generation
- [ ] Snakemake workflow generation
- [ ] Pipeline parameter validation
- [ ] Reproducible environment generation
- [ ] Workflow dry-run validation

### Analysis

- [ ] RNA-seq automation
- [ ] Variant-analysis automation
- [ ] ChIP-seq automation
- [ ] Single-cell workflow automation
- [ ] Metagenomics workflows
- [ ] Automated visualization generation
- [ ] Publication-ready report generation

### Platform

- [ ] Cloud execution backend
- [ ] Job queue and monitoring
- [ ] Compute-cost estimation
- [ ] Artifact storage
- [ ] Dataset/workflow versioning
- [ ] Team workspaces
- [ ] API/SDK
- [ ] Automated bioinformatics test suite
- [ ] Security and accessibility audits

---

## 🧭 Design Principle

MARGOTS should feel less like a collection of bioinformatics buttons and more like a **scientific operating layer**:

> **One conversation. One workspace. Many biological workflows.**

The scientist remains in control while MARGOTS handles the repetitive computational orchestration.

---

## ⭐ Contributing

MARGOTS welcomes bioinformatics workflows, scientific validation, software engineering, datasets, documentation and reproducibility improvements.

Please open an issue before major architectural changes so proposed workflows can be evaluated for scientific correctness and maintainability.

---

## 📜 License

See [LICENSE](LICENSE) for the applicable terms.

<div align="center">

### 🧬 MARGOTS
**AI-Native Bioinformatics · Genomic Workflow Automation · Scientific AI**

</div>
