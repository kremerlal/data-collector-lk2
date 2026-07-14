#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example."
  echo "Edit it for your Databricks workspace, then re-run: npm run dev:all"
  exit 1
fi

if [ -x .venv/bin/uvicorn ]; then
  UVICORN=.venv/bin/uvicorn
else
  UVICORN=uvicorn
fi

echo "Starting backend on http://localhost:8000 ..."
"$UVICORN" backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
trap 'echo; echo "Stopping backend ($BACKEND_PID)..."; kill "$BACKEND_PID" 2>/dev/null || true' EXIT INT TERM

echo "Starting frontend on http://localhost:5173 ..."
npm run dev
