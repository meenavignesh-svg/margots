"""SeqFlow pipeline generation layer.

Turns plain-English experimental design into structured analysis plans
and workflow sketches. Deterministic helpers stay local; LLM roles only
design and critique.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from .llm_engine import Engine, Result, Role


# Lightweight keyword heuristics so the UI can show an immediate plan
# even before any AI provider is configured.
ASSAY_HINTS = {
    "rna-seq": ["rna-seq", "rnaseq", "rna seq", "transcriptome", "differential expression"],
    "chip-seq": ["chip-seq", "chipseq", "chromatin", "peak calling"],
    "variant": ["variant", "wgs", "wes", "exome", "snp", "indel", "gatk"],
    "single-cell": ["single-cell", "scrna", "scRNA", "10x", "cell ranger", "seurat", "scanpy"],
    "metagenomics": ["metagenom", "16s", "shotgun", "microbiome"],
    "atac-seq": ["atac-seq", "atacseq", "chromatin accessibility"],
}

STANDARD_STAGES: Dict[str, List[str]] = {
    "rna-seq": [
        "Raw FASTQ QC (FastQC / MultiQC)",
        "Adapter & quality trimming (fastp or Trimmomatic)",
        "Alignment or quasi-mapping (STAR / HISAT2 / Salmon)",
        "Quantification (featureCounts / Salmon)",
        "Differential expression (DESeq2 / edgeR)",
        "Visualization & pathway enrichment",
    ],
    "chip-seq": [
        "Raw FASTQ QC",
        "Trimming",
        "Alignment (BWA / Bowtie2)",
        "Peak calling (MACS2)",
        "Peak annotation & motif analysis",
        "Differential binding (optional)",
    ],
    "variant": [
        "Raw FASTQ QC",
        "Alignment (BWA-MEM)",
        "Mark duplicates & BQSR (GATK best practices)",
        "Variant calling (GATK HaplotypeCaller / DeepVariant)",
        "Filtering & annotation (bcftools, VEP / ANNOVAR)",
        "Prioritization report",
    ],
    "single-cell": [
        "Cell Ranger / STARsolo quantification",
        "QC filtering (nCount, mito %, doublets)",
        "Normalization & integration",
        "Clustering & marker discovery (Seurat / Scanpy)",
        "Trajectory / cell-type annotation",
        "Publication figures",
    ],
    "metagenomics": [
        "QC & host depletion",
        "Taxonomic profiling or assembly",
        "Functional annotation",
        "Diversity / differential abundance",
    ],
    "atac-seq": [
        "QC & alignment",
        "Peak calling",
        "Nucleosome positioning / footprinting",
        "Differential accessibility",
    ],
    "generic": [
        "Define biological question & design matrix",
        "Raw data QC",
        "Primary processing (align / quantify)",
        "Statistical analysis",
        "Interpretation & reporting",
    ],
}


def detect_assay(text: str) -> str:
    t = text.lower()
    for assay, keywords in ASSAY_HINTS.items():
        if any(k in t for k in keywords):
            return assay
    return "generic"


def local_pipeline_skeleton(design: str, assay: Optional[str] = None) -> Dict[str, Any]:
    """Fully deterministic first-pass plan (no network)."""
    assay = assay or detect_assay(design)
    stages = STANDARD_STAGES.get(assay, STANDARD_STAGES["generic"])
    return {
        "layer": "DETERMINISTIC",
        "assay_guess": assay,
        "stages": stages,
        "design_preview": design[:500] + ("..." if len(design) > 500 else ""),
        "notes": [
            "This skeleton is rule-based. AI agents refine tools, parameters, and risk.",
            "Always confirm organism, reference genome build, and library strandedness.",
            "Cloud execution and large FASTQ handling are not performed in this local layer.",
        ],
    }


class PipelineAgent:
    """Natural-language experimental design → multi-agent pipeline plan."""

    def __init__(self, engine: Engine):
        self.engine = engine

    def plan(
        self,
        design: str,
        organism: str = "",
        data_type: str = "",
        extra_constraints: str = "",
    ) -> Result:
        design = (design or "").strip()
        if not design:
            return Result(
                facts={"error": "empty_design"},
                outputs={},
                errors={"input": "Experimental design text is required."},
                mode="pipeline",
            )

        assay = detect_assay(design + " " + data_type)
        facts = local_pipeline_skeleton(design, assay)
        if organism:
            facts["organism"] = organism.strip()
        if data_type:
            facts["data_type"] = data_type.strip()

        payload_parts = [
            "Experimental design / question:",
            design,
        ]
        if organism:
            payload_parts.append(f"Organism / system: {organism}")
        if data_type:
            payload_parts.append(f"Data type: {data_type}")
        if extra_constraints:
            payload_parts.append(f"Constraints: {extra_constraints}")
        payload_parts.append(
            "Produce a practical bioinformatics workflow. "
            "Architect: high-level stages + tools. "
            "QC: quality gates. "
            "Executor: concrete Nextflow/Snakemake or CLI sketch. "
            "Critic: top risks and cost controls."
        )
        payload = "\n\n".join(payload_parts)

        return self.engine.run(
            payload,
            facts=facts,
            roles=[Role.ARCHITECT, Role.QC, Role.EXECUTOR, Role.CRITIC],
            mode="pipeline",
        )
