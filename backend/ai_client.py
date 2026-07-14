"""Databricks Foundation Model API client."""

from __future__ import annotations

import os
from typing import Any

from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import ChatMessage, ChatMessageRole

_DEFAULT_ENDPOINT = "databricks-meta-llama-3-3-70b-instruct"


def _workspace_client() -> WorkspaceClient:
    host = (os.environ.get("DATABRICKS_HOST") or "").strip()
    token = (os.environ.get("DATABRICKS_TOKEN") or "").strip()
    if host and token and "REPLACE_WITH" not in token:
        return WorkspaceClient(host=host.removeprefix("https://").removeprefix("http://"), token=token)
    return WorkspaceClient()


def fm_endpoint() -> str:
    return (os.environ.get("DATABRICKS_FM_ENDPOINT") or _DEFAULT_ENDPOINT).strip()


def chat_completion(
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.2,
    max_tokens: int = 4096,
) -> str:
    """Call a Foundation Model serving endpoint and return assistant text."""
    client = _workspace_client()
    endpoint = fm_endpoint()
    chat_messages = [
        ChatMessage(role=ChatMessageRole(msg["role"]), content=msg["content"]) for msg in messages
    ]
    response = client.serving_endpoints.query(
        name=endpoint,
        messages=chat_messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    if response.choices:
        return (response.choices[0].message.content or "").strip()
    if response.output and isinstance(response.output, list) and response.output:
        first = response.output[0]
        if isinstance(first, dict):
            return str(first.get("content") or first.get("text") or "")
    raise RuntimeError(f"Empty response from model endpoint '{endpoint}'")
