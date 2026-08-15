"""
BioOmni AI - Ultimate Bioinformatics Analysis Platform
Main Streamlit Application
"""

import streamlit as st
import pandas as pd
from core.llm_engine import BioOmniLLM
from core.bio_analyzer import BioAnalyzer
import os

st.set_page_config(
    page_title="BioOmni AI",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.8rem;
        font-weight: 800;
        background: linear-gradient(90deg, #00c6ff, #0072ff, #00c853);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #666;
        margin-bottom: 2rem;
    }
    .stButton>button {
        width: 100%;
        border-radius: 8px;
        height: 3em;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_resource
def load_engine():
    return BioOmniLLM()

def main():
    st.markdown('<div class="main-header">🧬 BioOmni AI</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Multi-LLM Bioinformatics Analysis Engine • OpenAI + Anthropic + xAI</div>', unsafe_allow_html=True)

    llm = load_engine()
    analyzer = BioAnalyzer(llm)

    # Sidebar
    with st.sidebar:
        st.header("⚙️ Configuration")
        available = llm.available_providers()

        if not available:
            st.error("No API keys detected. Add keys to `.env` file.")
            st.code("OPENAI_API_KEY=...\nANTHROPIC_API_KEY=...\nXAI_API_KEY=...")
            st.stop()

        st.success(f"Active providers: {', '.join(available)}")

        provider = st.selectbox(
            "LLM Provider",
            options=["auto"] + available,
            help="auto picks the best available model"
        )

        st.divider()
        st.markdown("**Analysis Mode**")
        mode = st.radio(
            "Select task",
            [
                "Sequence Analysis",
                "Expression / Omics Data",
                "Variant Interpretation",
                "Free-form Analysis",
                "Multi-Model Consensus"
            ],
            label_visibility="collapsed"
        )

    # Main content
    if mode == "Sequence Analysis":
        st.subheader("🔬 Sequence Analysis")
        seq = st.text_area("Paste DNA / RNA / Protein sequence", height=150,
                           placeholder="ATGCGTA... or MVLSPADKTNVKAAWG...")
        question = st.text_input("Optional specific question",
                                 placeholder="e.g. Does this look like a kinase domain?")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("Run Classical Analysis", type="secondary"):
                if seq.strip():
                    with st.spinner("Computing..."):
                        stats = analyzer.analyze_sequence(seq)
                        st.json(stats)
                else:
                    st.warning("Please enter a sequence.")

        with col2:
            if st.button("Run Full AI Interpretation", type="primary"):
                if seq.strip():
                    with st.spinner("BioOmni is thinking deeply..."):
                        result = analyzer.interpret_sequence(seq, question, provider)
                        if "error" in result:
                            st.error(result["error"])
                        else:
                            st.markdown(f"**Model:** `{result.get('provider')} / {result.get('model')}`")
                            st.markdown(result["content"])
                else:
                    st.warning("Please enter a sequence.")

    elif mode == "Expression / Omics Data":
        st.subheader("📊 Expression & Omics Analysis")
        uploaded = st.file_uploader("Upload CSV / TSV", type=["csv", "tsv", "txt"])
        question = st.text_area("What would you like to analyze?",
                                placeholder="Perform differential expression insights, check for batch effects, suggest clustering...")

        if uploaded and st.button("Analyze Dataset", type="primary"):
            try:
                if uploaded.name.endswith(".tsv") or uploaded.name.endswith(".txt"):
                    df = pd.read_csv(uploaded, sep="\t")
                else:
                    df = pd.read_csv(uploaded)

                st.write("Preview:", df.head())
                with st.spinner("Running deep analysis across models..."):
                    result = analyzer.analyze_expression_data(df, question, provider)
                    st.subheader("Statistical Summary")
                    st.json(result["stats"])
                    st.subheader("AI Interpretation")
                    llm_res = result["llm_analysis"]
                    if "error" in llm_res:
                        st.error(llm_res["error"])
                    else:
                        st.markdown(f"**Model:** `{llm_res.get('provider')}`")
                        st.markdown(llm_res["content"])
            except Exception as e:
                st.error(f"Failed to read file: {e}")

    elif mode == "Variant Interpretation":
        st.subheader("🧬 Variant Interpretation")
        variant = st.text_area("Variant information",
                               height=120,
                               placeholder="e.g. BRCA1 c.5266dupC (p.Gln1756Profs*74) or chr17:43044295:G>A ...")
        if st.button("Interpret Variant", type="primary"):
            if variant.strip():
                with st.spinner("Consulting clinical knowledge..."):
                    result = analyzer.interpret_variant(variant, provider)
                    if "error" in result:
                        st.error(result["error"])
                    else:
                        st.markdown(f"**Model:** `{result.get('provider')}`")
                        st.markdown(result["content"])
            else:
                st.warning("Enter variant details.")

    elif mode == "Free-form Analysis":
        st.subheader("🧠 Free-form Bioinformatics Analysis")
        context = st.text_area("Data / Context", height=150,
                               placeholder="Describe your data, paste summary statistics, methods, etc.")
        question = st.text_area("Analysis question", height=100)
        if st.button("Run Analysis", type="primary"):
            if context.strip() and question.strip():
                with st.spinner("BioOmni analyzing..."):
                    result = analyzer.free_analysis(context, question, provider)
                    if "error" in result:
                        st.error(result["error"])
                    else:
                        st.markdown(f"**Model:** `{result.get('provider')}`")
                        st.markdown(result["content"])
            else:
                st.warning("Both context and question are required.")

    elif mode == "Multi-Model Consensus":
        st.subheader("🤝 Multi-Model Consensus")
        st.info("Runs the same prompt across all available models (OpenAI + Anthropic + xAI) for higher confidence answers.")
        prompt = st.text_area("Your bioinformatics question or data + question", height=200)
        if st.button("Get Consensus", type="primary"):
            if prompt.strip():
                with st.spinner("Querying all models in parallel..."):
                    results = analyzer.multi_model_consensus(prompt)
                    for provider, res in results.items():
                        with st.expander(f"{provider.upper()} response", expanded=True):
                            if "error" in res:
                                st.error(res["error"])
                            else:
                                st.markdown(res["content"])
            else:
                st.warning("Enter a prompt.")

    st.divider()
    st.caption("BioOmni AI • Margots Project • Powered by three frontier models")

if __name__ == "__main__":
    main()