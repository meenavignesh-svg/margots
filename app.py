import streamlit as st
import pandas as pd
from core.llm_engine import Engine
from core.bio_analyzer import Analyzer

st.set_page_config(page_title="Margots", layout="wide")


@st.cache_resource
def get_engine():
    return Engine()


def show(result):
    st.subheader("Measured facts")
    st.json(result.facts)

    if result.errors:
        st.error(result.errors)

    for role, text in result.outputs.items():
        with st.expander(role, expanded=True):
            st.markdown(text)


def main():
    st.title("Margots")
    st.caption("Sequence / table / variant analysis with three separate model backends")

    engine = get_engine()
    analyzer = Analyzer(engine)

    with st.sidebar:
        active = engine.available()
        if not active:
            st.error("No API keys found. Check .env")
            st.stop()
        st.write("Backends:", ", ".join(active))

        mode = st.radio("Mode", ["Sequence", "Expression", "Variant", "Free"])

    if mode == "Sequence":
        seq = st.text_area("Sequence", height=150)
        q = st.text_input("Question (optional)")
        if st.button("Run") and seq.strip():
            with st.spinner("Running..."):
                show(analyzer.sequence(seq, q or None))

    elif mode == "Expression":
        f = st.file_uploader("CSV or TSV", type=["csv", "tsv", "txt"])
        q = st.text_input("Question (optional)")
        if f and st.button("Run"):
            sep = "\t" if f.name.endswith((".tsv", ".txt")) else ","
            df = pd.read_csv(f, sep=sep)
            st.dataframe(df.head())
            with st.spinner("Running..."):
                show(analyzer.expression(df, q or None))

    elif mode == "Variant":
        text = st.text_area("Variant", height=120)
        if st.button("Run") and text.strip():
            with st.spinner("Running..."):
                show(analyzer.variant(text))

    elif mode == "Free":
        ctx = st.text_area("Context", height=120)
        q = st.text_area("Question", height=80)
        if st.button("Run") and ctx.strip() and q.strip():
            with st.spinner("Running..."):
                show(analyzer.free(ctx, q))


if __name__ == "__main__":
    main()
