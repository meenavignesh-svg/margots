import re
from typing import Any, Dict

import numpy as np
import pandas as pd
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from Bio.SeqUtils.ProtParam import ProteinAnalysis

from .llm_engine import Engine, Result


DNA_RE = re.compile(r"^[ACGTN]+$")
RNA_RE = re.compile(r"^[ACGUN]+$")
PROTEIN_RE = re.compile(r"^[ACDEFGHIKLMNPQRSTVWYBXZJUO]+$")


def normalize_sequence(sequence: str) -> str:
    return re.sub(r"\s+", "", sequence).upper()


def seq_stats(sequence: str) -> Dict[str, Any]:
    sequence = normalize_sequence(sequence)
    if not sequence:
        return {"error": "empty", "kind": "invalid"}

    is_dna = bool(DNA_RE.fullmatch(sequence))
    is_rna = bool(RNA_RE.fullmatch(sequence))

    # A/C/G-only sequences are inherently ambiguous between DNA and RNA.
    if is_dna and is_rna:
        kind = "nucleic_acid_ambiguous"
    elif is_dna:
        kind = "dna"
    elif is_rna:
        kind = "rna"
    elif PROTEIN_RE.fullmatch(sequence):
        kind = "protein"
    else:
        return {
            "error": "invalid_sequence",
            "kind": "invalid",
            "message": "Sequence contains characters that are not valid DNA, RNA, or protein symbols.",
        }

    out: Dict[str, Any] = {
        "kind": kind,
        "length": len(sequence),
        "preview": sequence[:200] + ("..." if len(sequence) > 200 else ""),
        "counts": {b: sequence.count(b) for b in sorted(set(sequence))},
    }

    if kind in ("dna", "rna", "nucleic_acid_ambiguous"):
        out["gc_percent"] = round(gc_fraction(sequence) * 100, 2)

        if kind == "dna":
            s = Seq(sequence)
            out["revcomp_preview"] = str(s.reverse_complement())[:100]
            if len(sequence) % 3 == 0:
                try:
                    out["translation_preview"] = str(s.translate(to_stop=True))[:100]
                except Exception as e:
                    out["translation_error"] = str(e)
            else:
                out["translation_note"] = "Translation preview omitted because sequence length is not divisible by 3."
        elif kind == "rna":
            out["translation_note"] = "RNA detected. Translation requires an explicit reading frame/start policy."
        else:
            out["sequence_note"] = "Only A/C/G symbols are present, so DNA vs RNA cannot be determined from sequence alone."

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
        payload = f"{q}\n\nSequence (truncated):\n{normalize_sequence(sequence)[:3500]}"
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
