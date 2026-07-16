"""Lakebase Postgres connection pool with OAuth token rotation."""

from __future__ import annotations

import os
from functools import lru_cache

from backend.lakebase_config import endpoint_name, require_configured


def _oauth_connection_class():
    import psycopg
    from databricks.sdk import WorkspaceClient

    class OAuthConnection(psycopg.Connection):
        @classmethod
        def connect(cls, conninfo: str = "", **kwargs):
            credential = WorkspaceClient().postgres.generate_database_credential(
                endpoint=endpoint_name()
            )
            kwargs["password"] = credential.token
            return super().connect(conninfo, **kwargs)

    return OAuthConnection


@lru_cache(maxsize=1)
def get_pool():
    """Shared connection pool (fresh OAuth token per new connection)."""
    require_configured()
    from psycopg_pool import ConnectionPool

    username = os.environ["PGUSER"]
    host = os.environ["PGHOST"]
    port = os.environ.get("PGPORT", "5432")
    database = os.environ.get("PGDATABASE", "databricks_postgres")
    sslmode = os.environ.get("PGSSLMODE", "require")

    return ConnectionPool(
        conninfo=(
            f"dbname={database} user={username} host={host} port={port} sslmode={sslmode}"
        ),
        connection_class=_oauth_connection_class(),
        min_size=1,
        max_size=10,
        open=True,
    )
