import sqlite3


class SettingsRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn

    def get(self, key: str) -> str | None:
        row = self.conn.execute(
            "SELECT value FROM app_settings WHERE key = ?",
            (key,),
        ).fetchone()
        return str(row["value"]) if row else None

    def set(self, key: str, value: str) -> str:
        self.conn.execute(
            """
            INSERT INTO app_settings (key, value, updated_at)
            VALUES (?, ?, strftime('%Y-%m-%d %H:%M:%f', 'now'))
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                updated_at = excluded.updated_at
            """,
            (key, value),
        )
        stored = self.conn.execute(
            "SELECT value FROM app_settings WHERE key = ?",
            (key,),
        ).fetchone()
        assert stored is not None
        return str(stored["value"])
