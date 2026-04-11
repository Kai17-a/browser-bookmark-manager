from fastapi.testclient import TestClient

from api.main import app


def test_get_settings_uses_request_origin_when_env_is_unset(monkeypatch):
    monkeypatch.delenv("API_BASE_URL", raising=False)

    with TestClient(app, base_url="https://bookmarks.example.com:8000") as client:
        response = client.get("/settings")

    assert response.status_code == 200
    assert response.json() == {
        "api_base_url": "https://bookmarks.example.com:8000"
    }


def test_get_settings_prefers_explicit_api_base_url(monkeypatch):
    monkeypatch.setenv("API_BASE_URL", "https://api.example.com")

    with TestClient(app, base_url="https://bookmarks.example.com:8000") as client:
        response = client.get("/settings")

    assert response.status_code == 200
    assert response.json() == {"api_base_url": "https://api.example.com"}
