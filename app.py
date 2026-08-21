"""MARGOTS Streamlit workspace — sequence analysis + SeqFlow pipeline generation."""

from __future__ import annotations

import streamlit as st
import pandas as pd

from core.llm_engine import Engine
from core.bio_analyzer import Analyzer
from core.pipeline_agent import local_pipeline_skeleton, detect_assay

st.set_page_config(page_title="MARGOTS", page_icon="🧬", layout="wide")


@st.cache_resource
def get_engine() -> Engine:
    return Engine()


def show(result) -> None:
    st.subheader("Measured / deterministic facts")
    st.json(result.facts)

    if result.errors:
        st.warning(
            "Some model backends failed. Results below are from successful backends only."
        )
        for role, error in result.errors.items():
            st.error(f"{role}: {error}")

    if not result.outputs:
        st.info(
            "Deterministic analysis completed. No AI provider is configured for the "
            "requested roles, so no AI interpretation was generated. "
            "Add provider keys and model IDs in the environment to enable agents."
        )
        return

    st.caption(f"Successful agent responses: {len(result.outputs)} · mode={result.mode}")
    for role, text in result.outputs.items():
        with st.expander(role.upper(), expanded=True):
            st.markdown(text)


def main() -> None:
    st.title("🧬 MARGOTS")
    st.caption(
        "Deterministic bioinformatics + multi-agent scientific reasoning · "
        "SeqFlow pipeline generation"
    )

    engine = get_engine()
    analyzer = Analyzer(engine)

    with st.sidebar:
        active = engine.available()
        if active:
            st.success(f"Configured agents: {', '.join(active)}")
        else:
            st.info(
                "No AI provider configured. Local deterministic analysis "
                "and rule-based pipeline skeletons remain available."
            )
            st.caption("Set API keys + *_MODEL variables to enable agents.")

        pipe_roles = engine.available_pipeline_roles()
        if pipe_roles:
            st.caption(f"Pipeline roles ready: {', '.join(pipe_roles)}")

        mode = st.radio(
            "Mode",
            ["Pipeline", "Sequence", "Expression", "Variant", "Free"],
            index=0,
        )

    # ── Pipeline (SeqFlow) ──────────────────────────────────────────────
    if mode == "Pipeline":
        st.markdown("### Automated genomic pipeline design")
        st.markdown(
            "Describe your experiment in plain English. MARGOTS builds a "
            "deterministic stage skeleton first, then (if providers are configured) "
            "runs Architect → QC → Executor → Critic agents."
        )

        design = st.text_area(
            "Experimental design",
            height=140,
            placeholder=(
                "Example: Paired-end RNA-seq of human PBMCs, 3 treated vs 3 control, "
                "stranded TruSeq library, want differential expression and pathway enrichment."
            ),
        )
        c1, c2 = st.columns(2)
        with c1:
            organism = st.text_input("Organism / system", placeholder="Homo sapiens")
        with c2:
            data_type = st.text_input(
                "Data type", placeholder="RNA-seq / ChIP-seq / WGS / scRNA-seq"
            )
        constraints = st.text_input(
            "Constraints (optional)",
            placeholder="Limited compute, prefer Nextflow, no commercial tools…",
        )

        if st.button("Generate pipeline plan", type="primary"):
            if not design.strip():
                st.warning("Enter an experimental design first.")
            else:
                # Instant deterministic preview
                skeleton = local_pipeline_skeleton(design, detect_assay(design + " " + data_type))
                st.markdown("#### Rule-based skeleton (local)")
                st.write(f"**Assay guess:** `{skeleton['assay_guess']}`")
                for i, stage in enumerate(skeleton["stages"], 1):
                    st.write(f"{i}. {stage}")

                with st.spinner("Running multi-agent pipeline design…"):
                    show(
                        analyzer.pipeline(
                            design=design,
                            organism=organism,
                            data_type=data_type,
                            constraints=constraints,
                        )
                    )

    # ── Sequence ────────────────────────────────────────────────────────
    elif mode == "Sequence":
        seq = st.text_area("Sequence", height=150, placeholder="Example: ATGCGTACGTT…")
        q = st.text_input("Question (optional)")
        if st.button("Run", type="primary"):
            if not seq.strip():
                st.warning("Enter a sequence before running the analysis.")
            else:
                with st.spinner("Running sequence analysis…"):
                    show(analyzer.sequence(seq, q or None))

    # ── Expression table ────────────────────────────────────────────────
    elif mode == "Expression":
        f = st.file_uploader("CSV or TSV", type=["csv", "tsv", "txt"])
        q = st.text_input("Question (optional)")
        if f and st.button("Run", type="primary"):
            try:
                sep = "\t" if f.name.lower().endswith((".tsv", ".txt")) else ","
                df = pd.read_csv(f, sep=sep)
                st.dataframe(df.head(), use_container_width=True)
                with st.spinner("Running table analysis…"):
                    show(analyzer.expression(df, q or None))
            except Exception as e:
                st.error(f"Could not read the uploaded table: {type(e).__name__}: {e}")

    # ── Variant ─────────────────────────────────────────────────────────
    elif mode == "Variant":
        text = st.text_area("Variant", height=120, placeholder="Example: TP53 p.R175H")
        if st.button("Run", type="primary"):
            if not text.strip():
                st.warning("Enter a variant description before running the analysis.")
            else:
                with st.spinner("Running variant analysis…"):
                    show(analyzer.variant(text))

    # ── Free ────────────────────────────────────────────────────────────
    elif mode == "Free":
        ctx = st.text_area("Context", height=120)
        q = st.text_area("Question", height=80)
        if st.button("Run", type="primary"):
            if not ctx.strip() or not q.strip():
                st.warning("Provide both context and a question before running the analysis.")
            else:
                with st.spinner("Running analysis…"):
                    show(analyzer.free(ctx, q))


if __name__ == "__main__":
    main()
