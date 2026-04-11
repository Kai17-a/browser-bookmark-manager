import os

from fastapi import Request

DATABASE_URL = os.getenv("DATABASE_URL", "bookmarks.db")
DEFAULT_API_BASE_URL = "http://localhost:8000"


def resolve_api_base_url(request: Request | None = None) -> str:
    configured = os.getenv("API_BASE_URL")
    if configured:
        return configured

    if request is None:
        return DEFAULT_API_BASE_URL

    return str(request.base_url).rstrip("/")
