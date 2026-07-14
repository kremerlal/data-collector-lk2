"""Field-level audit log for collection records."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Optional

from backend import config
from backend.sql_util import execute, fetchall


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _table() -> str:
    return config.t("record_audit_log")


def _serialize(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, (list, dict)):
        return json.dumps(value)
    return str(value)


def log_field_change(
    project_id: str,
    record_id: str,
    *,
    field_key: Optional[str],
    old_value: Any,
    new_value: Any,
    changed_by: str,
) -> None:
    old_s = _serialize(old_value)
    new_s = _serialize(new_value)
    if old_s == new_s:
        return
    execute(
        f"""
        INSERT INTO {_table()} (
            project_id, record_id, field_key, old_value, new_value, changed_by, changed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (project_id, record_id, field_key, old_s, new_s, changed_by, _now()),
    )


def log_record_created(
    project_id: str,
    record_id: str,
    values: dict[str, Any],
    *,
    changed_by: str,
) -> None:
    for key, val in values.items():
        if _serialize(val) is None:
            continue
        log_field_change(
            project_id,
            record_id,
            field_key=key,
            old_value=None,
            new_value=val,
            changed_by=changed_by,
        )


def log_record_updated(
    project_id: str,
    record_id: str,
    old_values: dict[str, Any],
    new_values: dict[str, Any],
    *,
    changed_by: str,
) -> None:
    keys = set(old_values) | set(new_values)
    for key in keys:
        log_field_change(
            project_id,
            record_id,
            field_key=key,
            old_value=old_values.get(key),
            new_value=new_values.get(key),
            changed_by=changed_by,
        )


def log_record_deleted(
    project_id: str,
    record_id: str,
    values: dict[str, Any],
    *,
    changed_by: str,
) -> None:
    for key, val in values.items():
        log_field_change(
            project_id,
            record_id,
            field_key=key,
            old_value=val,
            new_value=None,
            changed_by=changed_by,
        )


def list_record_audit(project_id: str, record_id: str) -> list[dict[str, Any]]:
    return fetchall(
        f"""
        SELECT field_key, old_value, new_value, changed_by, changed_at
        FROM {_table()}
        WHERE project_id = ? AND record_id = ?
        ORDER BY changed_at DESC, field_key NULLS LAST
        """,
        (project_id, record_id),
    )
