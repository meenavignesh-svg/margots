# MARGOTS Architecture

MARGOTS is designed as a browser-first scientific workspace with a clear separation between deterministic analysis, provider integrations, and presentation.

## High-level flow

```text
User input
   │
   ├── Sequence / file normalization
   │
   ▼
Deterministic bioinformatics layer
   │
   ├── composition
   ├── GC / molecular measurements
   ├── ORF / translation helpers
   └── format parsing
   │
   ▼
Scientific context builder
   │
   ├── facts
   ├── input metadata
   └── analysis results
   │
   ▼
Provider adapter layer
   │
   ├── model A
   ├── model B
   └── model C
   │
   ▼
Comparison / human review
   │
   ▼
Export / history / share
```

## Design rules

### 1. Deterministic first

Anything that can be calculated directly from the input should be calculated locally and deterministically before an AI model is asked to reason about it.

### 2. AI is advisory

Provider responses are model outputs, not ground truth. The UI should make this distinction clear and preserve the underlying deterministic measurements.

### 3. Provider isolation

AI providers should be replaceable without changing the biological analysis engine. Model IDs and credentials belong in configuration, never in source code.

### 4. Browser-first privacy

The normal application path does not require a MARGOTS database. Uploaded files and local sequence calculations stay in the browser unless the user explicitly sends data to an external provider.

### 5. Human-in-the-loop

Scientific conclusions require human review and, where appropriate, primary literature, validated databases, experiments, or domain-expert review.

## Data boundaries

```text
LOCAL / DETERMINISTIC
- sequence parsing
- sequence measurements
- UI state
- local history

EXTERNAL / USER-CONTROLLED
- AI provider requests
- third-party literature/search APIs
```

Do not use MARGOTS with protected health information, confidential datasets, or proprietary sequences unless the user has verified that the selected deployment and external providers are appropriate for that data.
