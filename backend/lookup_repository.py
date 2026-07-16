"""Lookup table data access."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from backend import config
from backend.models import LookupColumn, LookupRow, LookupTable
from backend.repository import slugify
from backend.sql_util import execute, fetchall, fetchone


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _table(name: str) -> str:
    return config.t(name)


def _parse_lookup(row: dict[str, Any]) -> LookupTable:
    columns = json.loads(row["columns_json"]) if row.get("columns_json") else []
    return LookupTable(
        lookup_id=row["lookup_id"],
        project_id=row["project_id"],
        name=row["name"],
        slug=row["slug"],
        description=row.get("description"),
        columns=[LookupColumn(**c) for c in columns],
        row_count=int(row.get("row_count") or 0),
        source=row.get("source") or "manual",
        source_catalog=row.get("source_catalog"),
        source_schema=row.get("source_schema"),
        source_table=row.get("source_table"),
        created_at=row["created_at"],
        created_by=row["created_by"],
        updated_at=row.get("updated_at"),
        updated_by=row.get("updated_by"),
    )


def _parse_row(row: dict[str, Any]) -> LookupRow:
    return LookupRow(
        row_id=row["row_id"],
        values=json.loads(row["values_json"]) if row.get("values_json") else {},
        sort_order=int(row["sort_order"]),
    )


def _is_uc_bind(lookup: LookupTable) -> bool:
    return lookup.source == "uc_bind"


def list_lookups(project_id: str) -> list[LookupTable]:
    rows = fetchall(
        f"SELECT * FROM {_table('lookup_tables')} WHERE project_id = ? ORDER BY name",
        (project_id,),
    )
    return [_parse_lookup(r) for r in rows]


def get_lookup(project_id: str, lookup_id: str) -> Optional[LookupTable]:
    row = fetchone(
        f"SELECT * FROM {_table('lookup_tables')} WHERE project_id = ? AND lookup_id = ?",
        (project_id, lookup_id),
    )
    return _parse_lookup(row) if row else None


def create_lookup(
    project_id: str,
    *,
    name: str,
    description: Optional[str],
    columns: list[LookupColumn],
    created_by: str,
    source: str = "manual",
    source_catalog: Optional[str] = None,
    source_schema: Optional[str] = None,
    source_table: Optional[str] = None,
    row_count: int = 0,
) -> LookupTable:
    lookup_id = str(uuid.uuid4())
    now = _now()
    slug = slugify(name)
    execute(
        f"""
        INSERT INTO {_table('lookup_tables')} (
            lookup_id, project_id, name, slug, description, columns_json,
            row_count, source, source_catalog, source_schema, source_table,
            created_at, created_by, updated_at, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            lookup_id,
            project_id,
            name,
            slug,
            description,
            json.dumps([c.model_dump() for c in columns]),
            row_count,
            source,
            source_catalog,
            source_schema,
            source_table,
            now,
            created_by,
            now,
            created_by,
        ),
    )
    return get_lookup(project_id, lookup_id)  # type: ignore[return-value]


def create_lookup_from_uc(
    project_id: str,
    *,
    name: str,
    description: Optional[str],
    source_catalog: str,
    source_schema: str,
    source_table: str,
    columns: Optional[list[LookupColumn]],
    created_by: str,
) -> LookupTable:
    from backend import uc_util

    resolved_columns = columns or uc_util.describe_table_columns(
        source_catalog, source_schema, source_table
    )
    row_count = uc_util.count_table_rows(source_catalog, source_schema, source_table)
    return create_lookup(
        project_id,
        name=name.strip(),
        description=description,
        columns=resolved_columns,
        created_by=created_by,
        source="uc_bind",
        source_catalog=source_catalog,
        source_schema=source_schema,
        source_table=source_table,
        row_count=row_count,
    )


def update_lookup(
    project_id: str,
    lookup_id: str,
    *,
    name: Optional[str],
    description: Optional[str],
    columns: Optional[list[LookupColumn]],
    updated_by: str,
) -> Optional[LookupTable]:
    lookup = get_lookup(project_id, lookup_id)
    if not lookup:
        return None
    if _is_uc_bind(lookup) and columns is not None:
        raise ValueError("Cannot change columns on a UC-bound lookup")

    updates: dict[str, Any] = {}
    if name is not None:
        updates["name"] = name
        updates["slug"] = slugify(name)
    if description is not None:
        updates["description"] = description
    if columns is not None:
        updates["columns_json"] = json.dumps([c.model_dump() for c in columns])
    if not updates:
        return lookup

    sets = ", ".join(f"{k} = ?" for k in updates)
    params = list(updates.values()) + [_now(), updated_by, project_id, lookup_id]
    execute(
        f"UPDATE {_table('lookup_tables')} SET {sets}, updated_at = ?, updated_by = ? WHERE project_id = ? AND lookup_id = ?",
        params,
    )
    return get_lookup(project_id, lookup_id)


def delete_lookup(project_id: str, lookup_id: str) -> None:
    execute(f"DELETE FROM {_table('lookup_rows')} WHERE lookup_id = ?", (lookup_id,))
    execute(
        f"DELETE FROM {_table('lookup_tables')} WHERE project_id = ? AND lookup_id = ?",
        (project_id, lookup_id),
    )


def _list_uc_lookup_rows(lookup: LookupTable) -> list[LookupRow]:
    from backend import uc_util

    if not lookup.source_catalog or not lookup.source_schema or not lookup.source_table:
        return []
    keys = [c.key for c in lookup.columns]
    raw_rows = uc_util.fetch_table_rows(
        lookup.source_catalog,
        lookup.source_schema,
        lookup.source_table,
        keys,
    )
    rows: list[LookupRow] = []
    for idx, raw in enumerate(raw_rows):
        values = {k: raw.get(k) for k in keys}
        row_id = str(values.get(keys[0], idx)) if keys else str(idx)
        rows.append(LookupRow(row_id=row_id, values=values, sort_order=idx))
    return rows


def list_lookup_rows(lookup_id: str) -> list[LookupRow]:
    lookup_row = fetchone(
        f"SELECT * FROM {_table('lookup_tables')} WHERE lookup_id = ?",
        (lookup_id,),
    )
    if not lookup_row:
        return []
    lookup = _parse_lookup(lookup_row)
    if _is_uc_bind(lookup):
        return _list_uc_lookup_rows(lookup)

    rows = fetchall(
        f"SELECT * FROM {_table('lookup_rows')} WHERE lookup_id = ? ORDER BY sort_order, row_id",
        (lookup_id,),
    )
    return [_parse_row(r) for r in rows]


def _require_editable(lookup_id: str) -> None:
    lookup_row = fetchone(
        f"SELECT source FROM {_table('lookup_tables')} WHERE lookup_id = ?",
        (lookup_id,),
    )
    if lookup_row and lookup_row.get("source") == "uc_bind":
        raise ValueError("Cannot edit rows on a UC-bound lookup")


def replace_lookup_rows(lookup_id: str, rows: list[LookupRow]) -> list[LookupRow]:
    _require_editable(lookup_id)
    execute(f"DELETE FROM {_table('lookup_rows')} WHERE lookup_id = ?", (lookup_id,))
    for idx, row in enumerate(rows):
        execute(
            f"""
            INSERT INTO {_table('lookup_rows')} (lookup_id, row_id, values_json, sort_order)
            VALUES (?, ?, ?, ?)
            """,
            (lookup_id, row.row_id or str(uuid.uuid4()), json.dumps(row.values), idx),
        )
    execute(
        f"UPDATE {_table('lookup_tables')} SET row_count = ? WHERE lookup_id = ?",
        (len(rows), lookup_id),
    )
    return list_lookup_rows(lookup_id)


def import_lookup_from_csv(
    project_id: str,
    *,
    name: str,
    csv_text: str,
    created_by: str,
) -> LookupTable:
    from backend.csv_util import parse_lookup_csv

    columns, raw_rows = parse_lookup_csv(csv_text)
    lookup = create_lookup(
        project_id,
        name=name.strip(),
        description=None,
        columns=columns,
        created_by=created_by,
        source="import",
    )
    rows = [
        LookupRow(row_id=str(uuid.uuid4()), values=raw, sort_order=idx)
        for idx, raw in enumerate(raw_rows)
    ]
    replace_lookup_rows(lookup.lookup_id, rows)
    return get_lookup(project_id, lookup.lookup_id)  # type: ignore[return-value]


def import_rows_from_csv(
    project_id: str,
    lookup_id: str,
    *,
    csv_text: str,
    updated_by: str,
) -> list[LookupRow]:
    from backend.csv_util import map_rows_to_lookup_columns, parse_lookup_csv

    lookup = get_lookup(project_id, lookup_id)
    if not lookup:
        raise ValueError("Lookup table not found")
    if _is_uc_bind(lookup):
        raise ValueError("Cannot import rows into a UC-bound lookup")

    columns, raw_rows = parse_lookup_csv(csv_text)
    update_lookup(project_id, lookup_id, name=None, description=None, columns=columns, updated_by=updated_by)
    mapped = map_rows_to_lookup_columns(columns, raw_rows)
    rows = [
        LookupRow(row_id=str(uuid.uuid4()), values=raw, sort_order=idx)
        for idx, raw in enumerate(mapped)
    ]
    return replace_lookup_rows(lookup_id, rows)
