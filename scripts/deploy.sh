#!/usr/bin/env bash
# Deploy Data Collector as a Databricks App via Asset Bundle (ophammer-style).
#
# Usage:
#   ./scripts/deploy.sh              # deploy to dev (default)
#   ./scripts/deploy.sh prod
#   DATABRICKS_DEPLOY_FOLDER=/Workspace/MyApps ./scripts/deploy.sh dev
#
# Prerequisites: Databricks CLI authenticated, npm, python venv optional for setup.
set -euo pipefail
cd "$(dirname "$0")/.."

TARGET="${1:-dev}"
DEPLOY_FOLDER="${DATABRICKS_DEPLOY_FOLDER:-/Workspace/DBRX-Apps}"
PROFILE="${DATABRICKS_CONFIG_PROFILE:-}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

PROFILE="${DATABRICKS_CONFIG_PROFILE:-$PROFILE}"
if [[ "$TARGET" == "prod" && -z "$PROFILE" ]]; then
  PROFILE=fvm
fi
WAREHOUSE_ID="${DATABRICKS_WAREHOUSE_ID:-}"
APP_NAME="${DATABRICKS_APP_NAME:-}"

# Workaround: Databricks CLI <0.274.1 fails to download Terraform (expired PGP key, Apr 2026).
# Use system Terraform when available until CLI is upgraded.
if command -v terraform >/dev/null 2>&1; then
  export DATABRICKS_TF_EXEC_PATH="${DATABRICKS_TF_EXEC_PATH:-$(command -v terraform)}"
  if [[ -z "${DATABRICKS_TF_VERSION:-}" ]]; then
    DATABRICKS_TF_VERSION="$(terraform version | sed -n 's/^Terraform v//p' | awk '{print $1}')"
    export DATABRICKS_TF_VERSION
  fi
fi

if [[ -z "$WAREHOUSE_ID" || "$WAREHOUSE_ID" == REPLACE_WITH_YOUR_WAREHOUSE_ID ]]; then
  echo "Set DATABRICKS_WAREHOUSE_ID in .env before deploying."
  exit 1
fi

# Avoid empty-array expansion — breaks on macOS bash 3.2 with `set -u`.
dbx() {
  if [[ -n "$PROFILE" ]]; then
    databricks -p "$PROFILE" "$@"
  else
    databricks "$@"
  fi
}

VAR_ARGS=(
  --var "deploy_folder=${DEPLOY_FOLDER}"
  --var "warehouse_id=${WAREHOUSE_ID}"
)
if [[ -n "$APP_NAME" ]]; then
  VAR_ARGS+=(--var "app_name=${APP_NAME}")
fi

echo "==> Workspace deploy folder: ${DEPLOY_FOLDER}"
echo "==> Bundle target: ${TARGET}"
echo "==> Ensuring workspace folder exists..."
dbx workspace mkdirs "${DEPLOY_FOLDER}"

if [[ -n "$WAREHOUSE_ID" ]]; then
  echo "==> Syncing warehouse id into app.yaml (${WAREHOUSE_ID})..."
  python3 - "$WAREHOUSE_ID" <<'PY'
import re
import sys
from pathlib import Path

warehouse_id = sys.argv[1]
path = Path("app.yaml")
text = path.read_text()
text = re.sub(
    r'(id:\s*")[^"]+(")',
    rf'\g<1>{warehouse_id}\2',
    text,
    count=1,
)
path.write_text(text)
PY
fi

echo "==> Building frontend (dist/)..."
npm run build

echo "==> Validating bundle..."
dbx bundle validate -t "$TARGET" "${VAR_ARGS[@]}"

echo "==> Deploying app (sync + create/update)..."
dbx bundle deploy -t "$TARGET" "${VAR_ARGS[@]}"

echo "==> Starting app..."
dbx bundle run data-collector -t "$TARGET" "${VAR_ARGS[@]}"

echo ""
echo "Done. Open the app from Databricks → Compute → Apps."
if [[ "$TARGET" == "dev" ]]; then
  echo "Bundle files synced under: ${DEPLOY_FOLDER}/data-collector/${TARGET}/<your-username>"
else
  echo "Bundle files synced under: ${DEPLOY_FOLDER}/data-collector/${TARGET}"
fi
echo ""
echo "If /api returns permission errors, grant the app service principal"
echo "USE CATALOG / SELECT on your metadata schema and collection tables."
