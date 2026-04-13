import sqlite3
from contextlib import contextmanager
from pathlib import Path

DATABASE_URL = "bookmarks.db"


def _resolve_sqlite_path(database_url: str) -> Path:
    path = Path(database_url)
    if path.is_absolute():
        return path
    return Path("data") / path


@contextmanager
def get_db(database_url: str = DATABASE_URL):
    """Yield a SQLite connection with foreign keys enabled and auto commit/rollback."""
    database_path = _resolve_sqlite_path(database_url)
    database_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(database_path)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
