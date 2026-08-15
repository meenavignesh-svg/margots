"""
BioOmni AI - Core Bioinformatics Analysis Engine
Handles classical computational biology + LLM interpretation.
"""

from typing import Optional, Dict, Any, List, Union
from Bio import SeqIO, Align
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction, molecular_weight
from Bio.SeqUtils.ProtParam import ProteinAnalysis
import pandas as pd
import numpy as np
from io import StringIO
import re

class BioAnalyzer:
    """Classical + AI-augmented bioinformatics analysis."""

    def __init__(self, llm_engine):
        self.llm = llm_engine

    # ── Sequence Analysis ──────────────────────────────────────────────

    def analyze_sequence(self, sequence: str, seq_type: str = "auto") -> Dict[str, Any]:
        sequence = sequence.strip().upper().replace(" ", "").replace("\n", "")
        if not sequence:
            return {"error": "Empty sequence"}

        # Auto-detect type
        if seq_type == "auto":
            if re.fullmatch(r"[ACGTN]+", sequence):
                seq_type = "dna"
            elif re.fullmatch(r"[ACGU]+", sequence):
                seq_type = "rna"
            else:
                seq_type = "protein"

        result = {
            "type": seq_type,
            "length": len(sequence),
            "sequence": sequence[:200] + ("..." if len(sequence) > 200 else "")
        }

        if seq_type in ("dna", "rna"):
            result["gc_content"] = round(gc_fraction(sequence) * 100, 2)
            result["composition"] = {
                base: sequence.count(base) for base in set(sequence)
            }
            if seq_type == "dna":
                seq_obj = Seq(sequence)
                result["reverse_complement"] = str(seq_obj.reverse_complement())[:100]
                try:
                    result["translation"] = str(seq_obj.translate(to_stop=True))[:100]
                except Exception:
                    result["translation"] = "Unable to translate"

        elif seq_type == "protein":
            try:
                pa = ProteinAnalysis(sequence)
                result["molecular_weight"] = round(pa.molecular_weight(), 2)
                result["isoelectric_point"] = round(pa.isoelectric_point(), 2)
                result["aromaticity"] = round(pa.aromaticity(), 4)
                result["instability_index"] = round(pa.instability_index(), 2)
                result["gravy"] = round(pa.gravy(), 3)
                result["secondary_structure_fraction"] = {
                    k: round(v, 3) for k, v in zip(
                        ["helix", "turn", "sheet"],
                        pa.secondary_structure_fraction()
                    )
                }
            except Exception as e:
                result["protein_analysis_error"] = str(e)

        return result

    def interpret_sequence(self, sequence: str, question: str = None, provider: str = "auto") -> Dict[str, Any]:
        stats = self.analyze_sequence(sequence)
        prompt = f"""Perform deep bioinformatics analysis on this biological sequence.

Sequence statistics:
{stats}

Full sequence (or beginning):
{sequence[:3000]}

User question: {question or "Provide a comprehensive scientific interpretation of this sequence. Include possible function, domains, evolutionary notes, and any red flags."}

Be rigorous and specific."""
        return self.llm.generate(prompt, provider=provider)

    # ── Expression / Tabular Data ──────────────────────────────────────

    def analyze_expression_data(self, df: pd.DataFrame, question: str = None, provider: str = "auto") -> Dict[str, Any]:
        summary = {
            "shape": df.shape,
            "columns": list(df.columns),
            "dtypes": {c: str(t) for c, t in df.dtypes.items()},
            "missing": df.isnull().sum().to_dict(),
            "numeric_summary": df.describe().to_dict() if not df.empty else {}
        }

        # Simple differential-like stats if possible
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

        prompt = f"""You are analyzing a bioinformatics dataset (likely gene expression, counts, or omics table).

Dataset summary:
{summary}

First 15 rows:
{df.head(15).to_string()}

User question / analysis request:
{question or "Perform a thorough exploratory analysis. Suggest appropriate statistical tests, normalization methods, potential batch effects, and biological insights. Recommend next steps for differential expression or clustering if relevant."}

Respond with clear scientific recommendations."""

        llm_result = self.llm.generate(prompt, provider=provider)
        return {
            "stats": summary,
            "llm_analysis": llm_result
        }

    # ── Variant Interpretation ─────────────────────────────────────────

    def interpret_variant(self, variant_info: str, provider: str = "auto") -> Dict[str, Any]:
        prompt = f"""You are a clinical bioinformatics expert. Interpret the following genetic variant information.

Variant data:
{variant_info}

Provide:
1. Likely molecular consequence
2. Potential clinical significance (benign / VUS / pathogenic reasoning)
3. Relevant genes/pathways
4. Recommended databases or further checks (ClinVar, gnomAD, etc.)
5. Limitations of this interpretation

Be precise and evidence-based."""
        return self.llm.generate(prompt, provider=provider)

    # ── Free-form Analysis ─────────────────────────────────────────────

    def free_analysis(self, data_description: str, question: str, provider: str = "auto") -> Dict[str, Any]:
        prompt = f"""Bioinformatics data / context:
{data_description}

Analysis request:
{question}

Provide a rigorous, step-by-step scientific analysis. Include methods, assumptions, and caveats."""
        return self.llm.generate(prompt, provider=provider)

    def multi_model_consensus(self, prompt: str) -> Dict[str, Any]:
        return self.llm.consensus(prompt)