"""Databricks Genie API client."""

from __future__ import annotations

from backend.ai_client import _workspace_client


def workspace_client():
    return _workspace_client()
