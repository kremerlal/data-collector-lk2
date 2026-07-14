#!/usr/bin/env bash
# Provision metadata tables using the project venv (avoids wrong-python / missing-deps issues).
set -euo pipefail
cd "$(dirname "$0")/.."

PYTHON="${PYTHON:-}"
if [[ -z "$PYTHON" && -x .venv/bin/python3 ]]; then
  PYTHON=.venv/bin/python3
elif [[ -z "$PYTHON" ]]; then
  PYTHON=python3
fi

if ! "$PYTHON" -c "import databricks.sql" 2>/dev/null; then
  echo "Databricks Python packages not found for: $PYTHON"
  echo ""
  echo "Create a venv and install deps:"
  echo "  python3 -m venv .venv"
  echo "  PIP_CONFIG_FILE=pip.conf .venv/bin/pip install -r requirements.txt"
  echo ""
  echo "Then re-run:"
  echo "  ./scripts/setup.sh"
  exit 1
fi

exec "$PYTHON" scripts/setup.py "$@"
