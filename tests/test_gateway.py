import os

os.environ.setdefault("MARGOTS_CORS_ORIGINS", "http://testserver")

from fastapi.testclient import TestClient
from server.main import app
from core.bio_analyzer import seq_stats


def test_health():
    r=TestClient(app).get('/health')
    assert r.status_code==200
    assert r.json()['status']=='ok'


def test_sequence_stats_is_deterministic():
    facts=seq_stats('ATGC')
    assert facts['length']==4
    assert facts['gc_percent']==50.0


def test_sequence_endpoint():
    r=TestClient(app).post('/v1/sequence/analyze',json={'sequence':'ATGC','question':'GC?'})
    assert r.status_code==200
    assert r.json()['facts']['gc_percent']==50.0
