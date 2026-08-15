"""
Margots — Biological reasoning lattice
"""

import streamlit as st
import pandas as pd
from core.llm_engine import Lattice
from core.bio_analyzer import Analyzer, Classical

st.set_page_config(
    page_title="Margots",
    page_icon="⬡",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
    .block-container { padding-top: 1.5rem; }
    h1 { font-weight: 700; letter-spacing: -0.03em; }
    .core-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #888; }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def boot():
    return Lattice()


def render_result(result):
    st.subheader("Classical facts")
    st.json(result.classical_facts)

    if result.unresolved_conflicts:
        st.warning("  ·  ".join(result.unresolved_conflicts))

    st.subheader("Core outputs under selective pressure")
    for claim in result.surviving_claims:
        with st.expander(f"{claim.core.value.upper()} core", expanded=True):
            st.markdown(claim.statement)

    if result.raw_core_outputs:
        with st.expander("Raw lattice dump"):
            st.json(result.raw_core_outputs)


def main():
    st.title("Margots")
    st.caption("Biological reasoning lattice · three cores · selective pressure · no averaging")

    lattice = boot()
    analyzer = Analyzer(lattice)

    with st.sidebar:
        st.markdown("**Active cores**")
        roles = lattice.active_roles
        if not roles:
            st.error("No keys loaded. Place OPENAI_API_KEY, ANTHROPIC_API_KEY, XAI_API_KEY in `.env`")
            st.stop()
        for r in roles:
            st.markdown(f"- `{r}`")

        st.divider()
        mode = st.radio(
            "Mode",
            ["Sequence", "Expression table", "Variant", "Free analysis"],
            label_visibility="collapsed",
        )

    if mode == "Sequence":
        seq = st.text_area("Sequence", height=160, placeholder="DNA / RNA / protein")
        q = st.text_input("Question (optional)")
        if st.button("Run lattice", type="primary") and seq.strip():
            with st.spinner("Classical measurement → core reasoning → selection"):
                result = analyzer.sequence(seq, q or None)
            render_result(result)

    elif mode == "Expression table":
        file = st.file_uploader("CSV / TSV", type=["csv", "tsv", "txt"])
        q = st.text_area("Question (optional)")
        if file and st.button("Run lattice", type="primary"):
            df = pd.read_csv(file, sep="\t" if file.name.endswith((".tsv", ".txt")) else ",")
            st.dataframe(df.head(8))
            with st.spinner("Classical measurement → core reasoning → selection"):
                result = analyzer.expression(df, q or None)
            render_result(result)

    elif mode == "Variant":
        text = st.text_area("Variant description", height=120)
        if st.button("Run lattice", type="primary") and text.strip():
            with st.spinner("Core reasoning → selection"):
                result = analyzer.variant(text)
            render_result(result)

    elif mode == "Free analysis":
        ctx = st.text_area("Context", height=140)
        q = st.text_area("Question", height=80)
        if st.button("Run lattice", type="primary") and ctx.strip() and q.strip():
            with st.spinner("Core reasoning → selection"):
                result = analyzer.free(ctx, q)
            render_result(result)


if __name__ == "__main__":
    main()