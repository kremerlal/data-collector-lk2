#!/usr/bin/env python3
"""Read per-target deploy settings from databricks.yml (single source of truth)."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


def read_target_variables(target: str, path: Path | None = None) -> dict[str, str]:
    text = (path or Path("databricks.yml")).read_text()
    section: str | None = None
    in_variables = False
    values: dict[str, str] = {}

    for line in text.splitlines():
        stripped = line.strip()
        if stripped == f"{target}:":
            section = target
            in_variables = False
            continue
        if section != target:
            continue
        if stripped == "variables:":
            in_variables = True
            continue
        if in_variables and stripped.startswith("workspace:"):
            break
        if in_variables and stripped and not line.startswith(" "):
            break
        if in_variables and ":" in stripped:
            key, value = stripped.split(":", 1)
            values[key.strip()] = value.strip()

    required = ("warehouse_id", "catalog", "schema", "app_name")
    missing = [key for key in required if not values.get(key)]
    if missing:
        raise SystemExit(
            f"Target '{target}' in databricks.yml is missing variables: {', '.join(missing)}"
        )
    return {key: values[key] for key in required}


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("Usage: bundle_target.py <dev|prod>", file=sys.stderr)
        return 1
    print(json.dumps(read_target_variables(argv[1])))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
