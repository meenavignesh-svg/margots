"""Multi-agent LLM engine for MARGOTS / SeqFlow.

Deterministic facts stay local. AI roles only interpret or design.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()


class Role(Enum):
    # Original scientific-reasoning roles
    STRICT = "strict"
    CONTEXT = "context"
    SKEPTIC = "skeptic"
    # SeqFlow pipeline roles
    ARCHITECT = "architect"   # designs the computational workflow
    QC = "qc"                 # data quality & validation focus
    EXECUTOR = "executor"     # concrete commands / Nextflow / Snakemake
    CRITIC = "critic"         # challenges assumptions & cost/runtime


PROMPTS: Dict[Role, str] = {
    Role.STRICT: (
        "Stick to what the numbers and sequence features actually support. "
        "Do not speculate. If something is unclear, say so. "
        "Prefer short, testable statements over narrative."
    ),
    Role.CONTEXT: (
        "Interpret the data in a biological context. "
        "Mention relevant pathways, typical functions, or known patterns when they fit. "
        "Still flag when you are going beyond the given measurements."
    ),
    Role.SKEPTIC: (
        "Look for alternative explanations and weak points. "
        "What else could produce these numbers? What assumptions are being made? "
        "List things that would change the interpretation if they were true."
    ),
    Role.ARCHITECT: (
        "You are a senior bioinformatics pipeline architect. "
        "Given an experimental design in plain English (and any measured facts), "
        "produce a clear, modular analysis plan. "
        "Name standard tools (FastQC, MultiQC, STAR/HISAT2, Salmon, featureCounts, "
        "DESeq2/edgeR, GATK, bcftools, Cell Ranger, Seurat/Scanpy, etc.) where appropriate. "
        "Separate required steps from optional refinements. "
        "State assumptions about organism, library type, and reference genome."
    ),
    Role.QC: (
        "You are a sequencing QC specialist. "
        "Focus on data quality checks, failure modes, and go/no-go criteria "
        "before heavy compute is spent. Recommend FastQC/MultiQC metrics, "
        "adapter trimming, contamination screens, and sample-level QC thresholds. "
        "Be concrete and conservative."
    ),
    Role.EXECUTOR: (
        "You produce concrete, runnable workflow sketches. "
        "Prefer Nextflow DSL2 or Snakemake structure when a full pipeline is needed; "
        "otherwise give ordered bash/CLI steps with clear inputs/outputs. "
        "Include container/conda notes when relevant. "
        "Never invent proprietary tool names. Prefer widely used open tools."
    ),
    Role.CRITIC: (
        "You critically review the proposed pipeline for scientific validity, "
        "runtime/cost risk, missing controls, and reproducibility gaps. "
        "List the top risks and the cheapest ways to mitigate them. "
        "Challenge over-engineered steps."
    ),
}


@dataclass
class Result:
    facts: Dict[str, Any]
    outputs: Dict[str, str]
    errors: Dict[str, str] = field(default_factory=dict)
    mode: str = "analysis"  # "analysis" | "pipeline"


class Engine:
    """Provider-agnostic multi-agent runner.

    Mapping of roles → providers is configuration-driven so backends
    remain replaceable without touching biological logic.
    """

    def __init__(self) -> None:
        self.clients: Dict[Role, Any] = {}
        self.models: Dict[Role, str] = {}
        self._init()

    def _init(self) -> None:
        # Anthropic → STRICT + ARCHITECT (careful, structured)
        key = os.getenv("ANTHROPIC_API_KEY")
        if key:
            from anthropic import Anthropic

            client = Anthropic(api_key=key)
            model = os.getenv("ANTHROPIC_MODEL")
            if model:
                self.clients[Role.STRICT] = client
                self.models[Role.STRICT] = model
                self.clients[Role.ARCHITECT] = client
                self.models[Role.ARCHITECT] = model

        # OpenAI → CONTEXT + EXECUTOR + QC
        key = os.getenv("OPENAI_API_KEY")
        if key:
            from openai import OpenAI

            client = OpenAI(api_key=key)
            model = os.getenv("OPENAI_MODEL")
            if model:
                self.clients[Role.CONTEXT] = client
                self.models[Role.CONTEXT] = model
                self.clients[Role.EXECUTOR] = client
                self.models[Role.EXECUTOR] = model
                self.clients[Role.QC] = client
                self.models[Role.QC] = model

        # xAI → SKEPTIC + CRITIC
        key = os.getenv("XAI_API_KEY")
        if key:
            from openai import OpenAI

            client = OpenAI(api_key=key, base_url="https://api.x.ai/v1")
            model = os.getenv("XAI_MODEL")
            if model:
                self.clients[Role.SKEPTIC] = client
                self.models[Role.SKEPTIC] = model
                self.clients[Role.CRITIC] = client
                self.models[Role.CRITIC] = model

    def available(self) -> List[str]:
        return sorted({r.value for r in self.clients})

    def available_pipeline_roles(self) -> List[str]:
        pipeline = {Role.ARCHITECT, Role.QC, Role.EXECUTOR, Role.CRITIC}
        return sorted(r.value for r in self.clients if r in pipeline)

    def _call(self, role: Role, user_content: str) -> str:
        client = self.clients[role]
        model = self.models.get(role)
        if not model:
            raise RuntimeError(
                f"No model configured for {role.value}. "
                "Set the corresponding *_MODEL environment variable."
            )

        system = PROMPTS[role]
        temperature = 0.2
        if role in (Role.SKEPTIC, Role.CRITIC):
            temperature = 0.45
        elif role == Role.ARCHITECT:
            temperature = 0.25

        # Anthropic path
        if role in (Role.STRICT, Role.ARCHITECT) and hasattr(client, "messages"):
            resp = client.messages.create(
                model=model,
                max_tokens=4096,
                temperature=temperature,
                system=system,
                messages=[{"role": "user", "content": user_content}],
            )
            return resp.content[0].text

        # OpenAI-compatible path
        resp = client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
        )
        return resp.choices[0].message.content or ""

    def run(
        self,
        payload: str,
        facts: Optional[Dict[str, Any]] = None,
        roles: Optional[List[Role]] = None,
        mode: str = "analysis",
    ) -> Result:
        facts = facts or {}
        outputs: Dict[str, str] = {}
        errors: Dict[str, str] = {}

        if roles is None:
            if mode == "pipeline":
                roles = [Role.ARCHITECT, Role.QC, Role.EXECUTOR, Role.CRITIC]
            else:
                roles = [Role.STRICT, Role.CONTEXT, Role.SKEPTIC]

        user_msg = (
            f"Measured facts:\n{facts}\n\n"
            f"Request:\n{payload}\n\n"
            "Respond with clear structure. Separate evidence from interpretation. "
            "If proposing a pipeline, list stages, tools, inputs/outputs, and assumptions."
        )

        for role in roles:
            if role not in self.clients:
                continue
            try:
                outputs[role.value] = self._call(role, user_msg)
            except Exception as e:
                errors[role.value] = f"{type(e).__name__}: {e}"

        return Result(facts=facts, outputs=outputs, errors=errors, mode=mode)
