"""Databricks SQL warehouse connections for Data Collector."""

from __future__ import annotations

import os
from typing import Optional


def _normalize_host(host: str) -> str:
    return host.removeprefix("https://").removeprefix("http://").rstrip("/")


def resolve_warehouse_http_path(
    *,
    warehouse_http_path: Optional[str] = None,
    warehouse_id: Optional[str] = None,
) -> str:
    """Resolve SQL warehouse HTTP path from explicit args or environment."""
    path = warehouse_http_path or os.environ.get("DATABRICKS_SQL_WAREHOUSE_HTTP_PATH")
    if path and "REPLACE_WITH" not in path:
        return path

    wid = warehouse_id or os.environ.get("DATABRICKS_WAREHOUSE_ID")
    if wid and "REPLACE_WITH" not in wid:
        return f"/sql/1.0/warehouses/{wid}"

    if path:
        return path

    from backend import config

    return config.warehouse_http_path()


def get_connection(
    *,
    host: Optional[str] = None,
    token: Optional[str] = None,
    warehouse_http_path: Optional[str] = None,
    warehouse_id: Optional[str] = None,
):
    """Open a SQL warehouse connection using a PAT or configured SDK profile."""
    from databricks import sql as dbsql

    http_path = resolve_warehouse_http_path(
        warehouse_http_path=warehouse_http_path,
        warehouse_id=warehouse_id,
    )

    pat_host = host or os.environ.get("DATABRICKS_HOST")
    pat_token = token or os.environ.get("DATABRICKS_TOKEN")

    if pat_host and pat_token:
        return dbsql.connect(
            server_hostname=_normalize_host(pat_host),
            http_path=http_path,
            access_token=pat_token,
        )

    from databricks.sdk import WorkspaceClient

    w = WorkspaceClient()
    return dbsql.connect(
        server_hostname=w.config.host,
        http_path=http_path,
        credentials_provider=lambda: w.config.authenticate,
    )
