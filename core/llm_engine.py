"""
Margots Lattice — Reasoning Cores

Three cores. Different selection pressures. No averaging.
"""

from __future__ import annotations
import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum
from dotenv import load_dotenv

load_dotenv()


class CoreRole(Enum):
    PRECISION = "precision"      # statistical + structural rigor
    CONTEXT = "context"          # systems biology + pattern recognition
    DIVERGENCE = "divergence"    # alternative explanations + edge cases


@dataclass
class Claim:
    statement: str
    confidence: float                  # 0.0 – 1.0
    core: CoreRole
    evidence: List[str] = field(default_factory=list)
    vulnerabilities: List[str] = field(default_factory=list)


@dataclass
class LatticeResult:
    surviving_claims: List[Claim]
    eliminated: List[Claim]
    unresolved_conflicts: List[str]
    classical_facts: Dict[str, Any]
    raw_core_outputs: Dict[str, str]


class ReasoningCore:
    """One specialized reasoning surface."""

    ROLE_INSTRUCTIONS = {
        CoreRole.PRECISION: (
            "You operate under extreme statistical and structural rigor. "
            "Reject any claim that lacks quantitative support or clear mechanistic basis. "
            "Prefer under-interpretation over speculation. "
            "Flag every assumption. Output only claims you can defend with method or measurement."
        ),
        CoreRole.CONTEXT: (
            "You operate as a systems biologist. "
            "Place every observation inside pathways, compartments, evolutionary constraints, and known biology. "
            "Draw on patterns across organisms and literature. "
            "Prefer coherent biological narratives, but mark where narrative outruns evidence."
        ),
        CoreRole.DIVERGENCE: (
            "You are adversarial. Your job is to generate the strongest alternative explanations "
            "and to expose hidden assumptions in the other cores. "
            "Never agree by default. Propose competing hypotheses and list conditions that would falsify the dominant view."
        ),
    }

    def __init__(self, role: CoreRole, client, model: str, provider_name: str):
        self.role = role
        self.client = client
        self.model = model
        self.provider_name = provider_name

    def reason(self, payload: str, classical_facts: Dict[str, Any]) -> str:
        system = self.ROLE_INSTRUCTIONS[self.role]
        user = (
            f"Classical computational facts (these are ground truth, not suggestions):\n"
            f"{classical_facts}\n\n"
            f"Analysis payload:\n{payload}\n\n"
            f"Produce structured claims. For every claim state: "
            f"(1) the claim, (2) confidence 0-1, (3) supporting evidence, (4) known vulnerabilities."
        )

        if self.provider_name == "anthropic":
            resp = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                temperature=0.25 if self.role != CoreRole.DIVERGENCE else 0.55,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
            return resp.content[0].text

        # OpenAI-compatible (OpenAI + xAI)
        resp = self.client.chat.completions.create(
            model=self.model,
            temperature=0.25 if self.role != CoreRole.DIVERGENCE else 0.55,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        return resp.choices[0].message.content


class Lattice:
    """
    The reasoning lattice.

    Precision, Context, and Divergence cores run independently.
    Their claims are then placed under selective pressure.
    Only claims that survive cross-examination remain.
    """

    def __init__(self):
        self.cores: Dict[CoreRole, ReasoningCore] = {}
        self._boot()

    def _boot(self):
        openai_key = os.getenv("OPENAI_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        xai_key = os.getenv("XAI_API_KEY")

        # Map roles to providers deliberately
        # Precision  → Anthropic (strong at careful reasoning)
        # Context    → OpenAI
        # Divergence → xAI
        if anthropic_key:
            from anthropic import Anthropic
            self.cores[CoreRole.PRECISION] = ReasoningCore(
                CoreRole.PRECISION,
                Anthropic(api_key=anthropic_key),
                os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"),
                "anthropic",
            )

        if openai_key:
            from openai import OpenAI
            self.cores[CoreRole.CONTEXT] = ReasoningCore(
                CoreRole.CONTEXT,
                OpenAI(api_key=openai_key),
                os.getenv("OPENAI_MODEL", "gpt-4o"),
                "openai",
            )

        if xai_key:
            from openai import OpenAI
            self.cores[CoreRole.DIVERGENCE] = ReasoningCore(
                CoreRole.DIVERGENCE,
                OpenAI(api_key=xai_key, base_url="https://api.x.ai/v1"),
                os.getenv("XAI_MODEL", "grok-3"),
                "xai",
            )

    @property
    def active_roles(self) -> List[str]:
        return [r.value for r in self.cores]

    def run(self, payload: str, classical_facts: Dict[str, Any] | None = None) -> LatticeResult:
        classical_facts = classical_facts or {}
        raw: Dict[str, str] = {}

        # Stage 1 — independent reasoning under different pressures
        for role, core in self.cores.items():
            try:
                raw[role.value] = core.reason(payload, classical_facts)
            except Exception as e:
                raw[role.value] = f"[core failure] {e}"

        # Stage 2 — selective pressure (cross-examination)
        surviving, eliminated, conflicts = self._select(raw, classical_facts)

        return LatticeResult(
            surviving_claims=surviving,
            eliminated=eliminated,
            unresolved_conflicts=conflicts,
            classical_facts=classical_facts,
            raw_core_outputs=raw,
        )

    def _select(
        self, raw: Dict[str, str], classical_facts: Dict[str, Any]
    ) -> tuple[List[Claim], List[Claim], List[str]]:
        """
        Crude but deliberate selection layer.
        In a later iteration this becomes a formal claim graph.
        For now: surface disagreements explicitly rather than smoothing them.
        """
        surviving: List[Claim] = []
        eliminated: List[Claim] = []
        conflicts: List[str] = []

        # Placeholder structured extraction — the important part is that
        # we refuse to collapse the three voices into one polite paragraph.
        for role_name, text in raw.items():
            if text.startswith("[core failure]"):
                continue
            # Keep the full output as a high-level claim for transparency
            surviving.append(
                Claim(
                    statement=text,
                    confidence=0.7,
                    core=CoreRole(role_name),
                    evidence=["see raw core output"],
                    vulnerabilities=["not yet formally adjudicated"],
                )
            )

        if len(raw) >= 2:
            conflicts.append(
                "Multiple cores produced independent analyses. "
                "Do not treat any single core as authoritative. "
                "Cross-compare the raw outputs below."
            )

        return surviving, eliminated, conflicts