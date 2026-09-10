import os

os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:8000")

from backend import app, services
from core.bio_analyzer import seq_stats, table_stats


def setup_function():
    for key in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "XAI_API_KEY"):
        os.environ.pop(key, None)
    services.cache_clear()


def test_health():
    client = app.test_client()
    response = client.get("/health")
    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert body["data"]["status"] == "healthy"


def test_sequence_requires_real_ai_backend():
    client = app.test_client()
    response = client.post("/api/analyze", json={"mode": "sequence", "sequence": "ATGCGTAA"})
    assert response.status_code == 503
    body = response.get_json()
    assert body["success"] is False
    assert body["error"]["code"] == "AI_NOT_CONFIGURED"


def test_deterministic_sequence_facts_are_real_calculations():
    facts = seq_stats("ATGCGTAA")
    assert facts["kind"] == "dna"
    assert facts["length"] == 8
    assert facts["gc_percent"] == 37.5


def test_invalid_sequence():
    client = app.test_client()
    response = client.post("/api/analyze", json={"mode": "sequence", "sequence": "ATG123"})
    assert response.status_code == 422
    body = response.get_json()
    assert body["success"] is False
    assert body["error"]["code"] == "INVALID_SEQUENCE"


def test_invalid_json():
    client = app.test_client()
    response = client.post("/api/analyze", data="not-json", content_type="application/json")
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "INVALID_JSON"


def test_missing_mode():
    client = app.test_client()
    response = client.post("/api/analyze", json={})
    assert response.status_code == 422
    assert response.get_json()["error"]["code"] == "INVALID_MODE"


def test_expression_facts_are_real_calculations():
    import pandas as pd
    df = pd.DataFrame([{"gene":"TP53","control":10,"treated":18},{"gene":"MYC","control":5,"treated":2}])
    facts = table_stats(df)
    assert facts["shape"] == [2,3]
    assert facts["columns"] == ["gene","control","treated"]


def test_cors_header_for_allowed_origin():
    client = app.test_client()
    response = client.get("/health", headers={"Origin": "http://localhost:8000"})
    assert response.status_code == 200
    assert response.headers.get("Access-Control-Allow-Origin") == "http://localhost:8000"
