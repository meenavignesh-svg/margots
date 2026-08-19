import streamlit as st
import pandas as pd
from core.llm_engine import Engine
from core.bio_analyzer import Analyzer

st.set_page_config(page_title="MARGOTS", page_icon="🧬", layout="wide")


@st.cache_resource
def get_engine():
    return Engine()


def show(result):
    st.subheader("Measured facts")
    st.json(result.facts)

    if result.errors:
        st.warning(
            "Some model backends failed. Results below are from successful backends only."
        )
        for role, error in result.errors.items():
            st.error(f"{role}: {error}")

    if not result.outputs:
        st.info(
            "Deterministic analysis completed. No AI provider is configured, so no AI interpretation was requested. "
            "Add a provider key and model in your environment to enable AI-assisted reasoning."
        )
        return

    st.caption(f"Successful backends: {len(result.outputs)}")
    for role, text in result.outputs.items():
        with st.expander(role, expanded=True):
            st.markdown(text)


def main():
    st.title("🧬 MARGOTS")
    st.caption("Bioinformatics analysis with optional multi-model scientific reasoning")

    engine = get_engine()
    analyzer = Analyzer(engine)

    with st.sidebar:
        active = engine.available()
        if active:
            st.success(f"Configured AI backends: {', '.join(active)}")
        else:
            st.info(
                "No AI provider configured. Local deterministic bioinformatics analysis remains available."
            )
            st.caption("Set an API key and corresponding model variable to enable AI-assisted reasoning.")

        mode = st.radio("Mode", ["Sequence", "Expression", "Variant", "Free"])

    if mode == "Sequence":
        seq = st.text_area("Sequence", height=150, placeholder="Example: ATGCGTACGTT...")
        q = st.text_input("Question (optional)")
        if st.button("Run", type="primary"):
            if not seq.strip():
                st.warning("Enter a sequence before running the analysis.")
            else:
                with st.spinner("Running sequence analysis..."):
                    show(analyzer.sequence(seq, q or None))

    elif mode == "Expression":
        f = st.file_uploader("CSV or TSV", type=["csv", "tsv", "txt"])
        q = st.text_input("Question (optional)")
        if f and st.button("Run", type="primary"):
            try:
                sep = "\t" if f.name.lower().endswith((".tsv", ".txt")) else ","
                df = pd.read_csv(f, sep=sep)
                st.dataframe(df.head(), use_container_width=True)
                with st.spinner("Running table analysis..."):
                    show(analyzer.expression(df, q or None))
            except Exception as e:
                st.error(f"Could not read the uploaded table: {type(e).__name__}: {e}")

    elif mode == "Variant":
        text = st.text_area("Variant", height=120, placeholder="Example: TP53 p.R175H")
        if st.button("Run", type="primary"):
            if not text.strip():
                st.warning("Enter a variant description before running the analysis.")
            else:
                with st.spinner("Running variant analysis..."):
                    show(analyzer.variant(text))

    elif mode == "Free":
        ctx = st.text_area("Context", height=120)
        q = st.text_area("Question", height=80)
        if st.button("Run", type="primary"):
            if not ctx.strip() or not q.strip():
                st.warning("Provide both context and a question before running the analysis.")
            else:
                with st.spinner("Running analysis..."):
                    show(analyzer.free(ctx, q))


if __name__ == "__main__":
    main()
