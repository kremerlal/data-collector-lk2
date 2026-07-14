"""SQL execution helpers."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Iterator, Optional

from backend.db import get_connection


@contextmanager
def cursor() -> Iterator[Any]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            yield cur


def fetchall(sql: str, params: Optional[tuple | list] = None) -> list[dict[str, Any]]:
    with cursor() as cur:
        cur.execute(sql, params or ())
        columns = [desc[0] for desc in cur.description] if cur.description else []
        return [dict(zip(columns, row)) for row in cur.fetchall()]


def fetchone(sql: str, params: Optional[tuple | list] = None) -> Optional[dict[str, Any]]:
    rows = fetchall(sql, params)
    return rows[0] if rows else None


def execute(sql: str, params: Optional[tuple | list] = None) -> None:
    with cursor() as cur:
        cur.execute(sql, params or ())
