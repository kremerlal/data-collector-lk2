"""CSV parsing helpers for lookup table import."""

from __future__ import annotations

import csv
import io
import re
from typing import Any

from backend.models import LookupColumn
from backend.repository import slugify

_SLUG_RE = re.compile(r"[^a-z0-9]+")


def _column_key(header: str, index: int) -> str:
    key = slugify(header.strip()) if header.strip() else f"col_{index}"
    return key[:80] or f"col_{index}"


def parse_lookup_csv(csv_text: str) -> tuple[list[LookupColumn], list[dict[str, Any]]]:
    """Parse CSV text into lookup columns and row value dicts."""
    text = csv_text.strip()
    if not text:
        raise ValueError("CSV is empty")

    sample = text[:2048]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel

    reader = csv.reader(io.StringIO(text), dialect)
    parsed_rows = [row for row in reader if any(cell.strip() for cell in row)]
    if not parsed_rows:
        raise ValueError("CSV has no data rows")

    headers = parsed_rows[0]
    keys = [_column_key(h, i) for i, h in enumerate(headers)]
    columns = [
        LookupColumn(key=key, label=(header.strip() or key))
        for key, header in zip(keys, headers)
    ]

    data_rows: list[dict[str, Any]] = []
    for row in parsed_rows[1:]:
        values = {keys[i]: (row[i].strip() if i < len(row) else "") for i in range(len(keys))}
        if any(str(v) for v in values.values()):
            data_rows.append(values)

    if not data_rows:
        raise ValueError("CSV has headers but no data rows")

    return columns, data_rows


def map_rows_to_lookup_columns(
    columns: list[LookupColumn],
    raw_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Map parsed CSV rows to an existing lookup's column keys."""
    keys = [c.key for c in columns]
    mapped: list[dict[str, Any]] = []
    for raw in raw_rows:
        row = {key: raw.get(key, "") for key in keys}
        if any(str(v) for v in row.values()):
            mapped.append(row)
    return mapped


def _read_csv_rows(csv_text: str) -> list[list[str]]:
    text = csv_text.strip()
    if not text:
        raise ValueError("CSV is empty")
    sample = text[:2048]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel
    reader = csv.reader(io.StringIO(text), dialect)
    return [row for row in reader if any(cell.strip() for cell in row)]


def parse_records_csv(csv_text: str, field_keys: list[str]) -> list[dict[str, Any]]:
    """Parse CSV into record value dicts keyed by field_key."""
    parsed_rows = _read_csv_rows(csv_text)
    if not parsed_rows:
        raise ValueError("CSV is empty")

    headers = [h.strip() for h in parsed_rows[0]]
    header_keys = [_column_key(h, i) for i, h in enumerate(headers)]

    # Map CSV columns to known field keys (match by field_key or slugified header).
    key_index: dict[str, int] = {}
    for idx, hk in enumerate(header_keys):
        if hk in field_keys:
            key_index[hk] = idx
        else:
            for fk in field_keys:
                if slugify(fk) == hk or slugify(headers[idx]) == slugify(fk):
                    key_index[fk] = idx
                    break

    if not key_index:
        raise ValueError(
            f"CSV headers must match form field keys. Expected one of: {', '.join(field_keys)}"
        )

    records: list[dict[str, Any]] = []
    for row in parsed_rows[1:]:
        values: dict[str, Any] = {}
        for fk, col_idx in key_index.items():
            values[fk] = row[col_idx].strip() if col_idx < len(row) else ""
        if any(str(v) for v in values.values()):
            records.append(values)
    if not records:
        raise ValueError("CSV has headers but no data rows")
    return records


def records_to_csv(field_keys: list[str], rows: list[dict[str, Any]]) -> str:
    """Serialize records to CSV with a header row of field keys."""
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(field_keys)
    for row in rows:
        values = row.get("values", row)
        writer.writerow([values.get(k, "") for k in field_keys])
    return buf.getvalue()
