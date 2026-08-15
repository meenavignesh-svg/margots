import re
from typing import Any, Dict
import pandas as pd
import numpy as np
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from Bio.SeqUtils.ProtParam import ProteinAnalysis

from .llm_engine import Engine, Result


def seq_stats(sequence: str) -> Dict[str, Any]:
    sequence = sequence.strip().upper().replace(" ", "").replace("\n", "")
    if not sequence:
        return {"error": "empty"}

    if re.fullmatch(r"[ACGTN]+", sequence):
        kind = "dna"
    elif re.fullmatch(r"[ACGU]+", sequence):
        kind = "rna"
    else:
        kind = "protein"

    out = {
        "kind": kind,
        "length": len(sequence),
        "preview": sequence[:200] + ("..." if len(sequence) > 200 else ""),
    }

    if kind in ("dna", "rna"):
        out["gc_percent"] = round(gc_fraction(sequence) * 100, 2)
        out["counts"] = {b: sequence.count(b) for b in sorted(set(sequence))}
        if kind == "dna":
            s = Seq(sequence)
            out["revcomp_preview"] = str(s.reverse_complement())[:100]
            try:
                out["translation_preview"] = str(s.translate(to_stop=True))[:100]
            except Exception:
                pass

    if kind == "protein":
        try:
            pa = ProteinAnalysis(sequence)
            out["mw"] = round(pa.molecular_weight(), 1)
            out["pi"] = round(pa.isoelectric_point(), 2)
            out["aromaticity"] = round(pa.aromaticity(), 3)
            out["instability"] = round(pa.instability_index(), 2)
            out["gravy"] = round(pa.gravy(), 3)
            helix, turn, sheet = pa.secondary_structure_fraction()
            out["ss"] = {
                "helix": round(helix, 3),
                "turn": round(turn, 3),
                "sheet": round(sheet, 3),
            }
        except Exception as e:
            out["protein_error"] = str(e)

    return out


def table_stats(df: pd.DataFrame) -> Dict[str, Any]:
    num = df.select_dtypes(include=[np.number])
    return {
        "shape": list(df.shape),
        "columns": list(df.columns),
        "nulls": df.isnull().sum().to_dict(),
        "describe": num.describe().round(3).to_dict() if len(num.columns) else {},
    }


class Analyzer:
    def __init__(self, engine: Engine):
        self.engine = engine

    def sequence(self, sequence: str, question: str | None = None) -> Result:
        facts = seq_stats(sequence)
        q = question or "What can be reliably said about this sequence?"
        payload = f"{q}\n\nSequence (truncated):\n{sequence[:3500]}"
        return self.engine.run(payload, facts)

    def expression(self, df: pd.DataFrame, question: str | None = None) -> Result:
        facts = table_stats(df)
        q = question or "Summarize the main patterns and any obvious issues in this table."
        return self.engine.run(q, facts)

    def variant(self, text: str) -> Result:
        payload = (
            f"Variant description:\n{text}\n\n"
            "Comment on possible molecular effect and what still needs external database checks."
        )
        return self.engine.run(payload, {"source": "user text only"})

    def free(self, context: str, question: str) -> Result:
        return self.engine.run(f"{context}\n\n{question}", {})
