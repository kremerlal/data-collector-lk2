#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env — add DATABRICKS_HOST, DATABRICKS_TOKEN, and DATABRICKS_WAREHOUSE_ID, then re-run."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [ -z "${DATABRICKS_TOKEN:-}" ] || [ "${DATABRICKS_TOKEN}" = "REPLACE_WITH_YOUR_TOKEN" ]; then
  echo "Set DATABRICKS_TOKEN in .env before running the API (Databricks SQL warehouse auth)."
  exit 1
fi

if [ -x .venv/bin/uvicorn ]; then
  UVICORN=.venv/bin/uvicorn
else
  UVICORN=uvicorn
fi

if [ -x .venv/bin/python ] && ! .venv/bin/python -c "import psycopg_pool" 2>/dev/null; then
  echo "Installing Lakebase deps (psycopg)..."
  PIP_CONFIG_FILE=pip.conf .venv/bin/pip install -q 'psycopg[binary,pool]>=3.1.0'
fi

echo "Backend  → http://localhost:8000"
echo "Frontend → http://localhost:5173"
"$UVICORN" backend.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
trap 'kill "$BACKEND_PID" 2>/dev/null || true' EXIT INT TERM
npm run dev
