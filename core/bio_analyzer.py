"""
Margots — Classical computation layer

All hard measurements happen here.
No language model is allowed to invent numbers.
"""

from __future__ import annotations
import re
from typing import Any, Dict
import pandas as pd
import numpy as np
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from Bio.SeqUtils.ProtParam import ProteinAnalysis

from .llm_engine import Lattice, LatticeResult


class Classical:
    """Pure computation. Deterministic. No opinions."""

    @staticmethod
    def sequence(sequence: str) -> Dict[str, Any]:
        sequence = sequence.strip().upper().replace(" ", "").replace("\n", "")
        if not sequence:
            return {"error": "empty sequence"}

        if re.fullmatch(r"[ACGTN]+", sequence):
            kind = "dna"
        elif re.fullmatch(r"[ACGU]+", sequence):
            kind = "rna"
        else:
            kind = "protein"

        out: Dict[str, Any] = {
            "kind": kind,
            "length": len(sequence),
            "head": sequence[:180] + ("…" if len(sequence) > 180 else ""),
        }

        if kind in ("dna", "rna"):
            out["gc_percent"] = round(gc_fraction(sequence) * 100, 3)
            out["base_counts"] = {b: sequence.count(b) for b in sorted(set(sequence))}
            if kind == "dna":
                s = Seq(sequence)
                out["reverse_complement_head"] = str(s.reverse_complement())[:120]
                try:
                    out["translation_head"] = str(s.translate(to_stop=True))[:120]
                except Exception:
                    out["translation_head"] = None

        if kind == "protein":
            try:
                pa = ProteinAnalysis(sequence)
                out.update({
                    "molecular_weight": round(pa.molecular_weight(), 2),
                    "isoelectric_point": round(pa.isoelectric_point(), 3),
                    "aromaticity": round(pa.aromaticity(), 4),
                    "instability_index": round(pa.instability_index(), 3),
                    "gravy": round(pa.gravy(), 4),
                    "ss_fraction": dict(zip(
                        ["helix", "turn", "sheet"],
                        [round(v, 4) for v in pa.secondary_structure_fraction()]
                    )),
                })
            except Exception as e:
                out["protein_error"] = str(e)

        return out

    @staticmethod
    def table(df: pd.DataFrame) -> Dict[str, Any]:
        numeric = df.select_dtypes(include=[np.number])
        return {
            "shape": df.shape,
            "columns": list(df.columns),
            "dtypes": {c: str(t) for c, t in df.dtypes.items()},
            "null_counts": df.isnull().sum().to_dict(),
            "numeric_describe": numeric.describe().to_dict() if not numeric.empty else {},
            "head": df.head(12).to_dict(orient="list"),
        }


class Analyzer:
    """
    Orchestrates classical facts → lattice reasoning.
    The lattice never sees data that has not first been measured.
    """

    def __init__(self, lattice: Lattice):
        self.lattice = lattice

    def sequence(self, sequence: str, question: str | None = None) -> LatticeResult:
        facts = Classical.sequence(sequence)
        payload = (
            f"Sequence under examination.\n"
            f"Question: {question or 'Produce the strongest defensible biological claims about this sequence.'}\n"
            f"Raw sequence (truncated if long):\n{sequence[:4000]}"
        )
        return self.lattice.run(payload, classical_facts=facts)

    def expression(self, df: pd.DataFrame, question: str | None = None) -> LatticeResult:
        facts = Classical.table(df)
        payload = (
            f"Tabular biological dataset.\n"
            f"Question: {question or 'Extract the most rigorous statistical and biological claims possible from this table.'}"
        )
        return self.lattice.run(payload, classical_facts=facts)

    def variant(self, description: str) -> LatticeResult:
        payload = (
            f"Genetic variant description:\n{description}\n\n"
            f"Produce claims about molecular consequence, clinical relevance, "
            f"and what would falsify those claims. Classical databases are not queried here; "
            f"state what must still be checked externally."
        )
        return self.lattice.run(payload, classical_facts={"source": "user-supplied variant text only"})

    def free(self, context: str, question: str) -> LatticeResult:
        payload = f"Context:\n{context}\n\nQuestion:\n{question}"
        return self.lattice.run(payload, classical_facts={})