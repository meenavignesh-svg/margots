import os

os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:8000")

from backend import app, services


def setup_function():
    services.cache_clear()


def test_health():
    client = app.test_client()
    response = client.get("/health")
    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert body["data"]["status"] == "healthy"


def test_sequence_success_without_ai():
    for key in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "XAI_API_KEY"):
        os.environ.pop(key, None)
    services.cache_clear()
    client = app.test_client()
    response = client.post("/api/analyze", json={"mode": "sequence", "sequence": "ATGCGTAA"})
    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert body["data"]["facts"]["length"] == 8


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


def test_expression_rows():
    client = app.test_client()
    response = client.post("/api/analyze", json={
        "mode": "expression",
        "rows": [{"gene": "TP53", "control": 10, "treated": 18}, {"gene": "MYC", "control": 5, "treated": 2}],
    })
    assert response.status_code == 200
    body = response.get_json()
    assert body["data"]["facts"]["shape"] == [2, 3]


def test_cors_header_for_allowed_origin():
    client = app.test_client()
    response = client.get("/health", headers={"Origin": "http://localhost:8000"})
    assert response.status_code == 200
    assert response.headers.get("Access-Control-Allow-Origin") == "http://localhost:8000"
