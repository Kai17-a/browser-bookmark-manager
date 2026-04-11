import os

DATABASE_URL = os.getenv("DATABASE_URL", "bookmarks.db")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
