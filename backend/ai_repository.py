"""Audit log for AI generations."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from backend import config
from backend.sql_util import execute


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _table() -> str:
    return config.t("ai_generation_log")


def log_generation(
    *,
    user_email: str,
    generation_type: str,
    prompt: str,
    response_json: Optional[dict[str, Any]] = None,
    project_id: Optional[str] = None,
    model_endpoint: Optional[str] = None,
    error: Optional[str] = None,
) -> None:
    execute(
        f"""
        INSERT INTO {_table()} (
            log_id, project_id, user_email, generation_type, prompt,
            response_json, model_endpoint, error, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            str(uuid.uuid4()),
            project_id,
            user_email,
            generation_type,
            prompt[:8000],
            json.dumps(response_json) if response_json is not None else None,
            model_endpoint,
            error[:2000] if error else None,
            _now(),
        ),
    )
