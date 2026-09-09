import os

os.environ.setdefault("MARGOTS_CORS_ORIGINS", "http://testserver")
os.environ.setdefault("MARGOTS_ENV", "test")

from fastapi.testclient import TestClient

from core.bio_analyzer import seq_stats
from core.pipeline_agent import detect_assay, local_pipeline_skeleton
from server.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body.get("success") is True
    assert body.get("status") == "healthy"


def test_ready():
    r = client.get("/ready")
    assert r.status_code == 200
    assert r.json()["success"] is True


def test_sequence_stats_deterministic():
    facts = seq_stats("ATGC")
    assert facts["length"] == 4
    assert facts["gc_percent"] == 50.0


def test_sequence_endpoint():
    r = client.post(
        "/v1/sequence/analyze",
        json={"sequence": "ATGC", "question": "GC?", "with_ai": False},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["data"]["facts"]["gc_percent"] == 50.0


def test_sequence_invalid():
    r = client.post(
        "/v1/sequence/analyze",
        json={"sequence": "ZZZZ", "with_ai": False},
    )
    assert r.status_code == 422
    body = r.json()
    assert body["success"] is False
    assert body["error"]["code"] == "INVALID_SEQUENCE"


def test_pipeline_skeleton_local():
    sk = local_pipeline_skeleton("RNA-seq differential expression human samples")
    assert sk["assay_guess"] == "rna-seq"
    assert len(sk["stages"]) >= 3


def test_pipeline_endpoint():
    r = client.post(
        "/v1/pipeline/plan",
        json={
            "design": "Paired-end RNA-seq 3 treated vs 3 control",
            "organism": "Homo sapiens",
            "with_ai": False,
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["data"]["facts"]["assay_guess"] == "rna-seq"


def test_empty_query_validation():
    r = client.post("/v1/research/search", json={"query": ""})
    assert r.status_code == 422  # pydantic validation
