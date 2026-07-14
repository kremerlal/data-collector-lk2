# Data Collector

A Databricks App for ingesting, validating, and managing enterprise data collections. Built from the **dhs-ophammer** project template (React + FastAPI + Node) with the **DHS Scorecard** layout shell — navy sidebar, header bar, DHS brand colors, and content-area dark/light mode.

## Architecture

- **Frontend** — React + Vite + MUI, built to `dist/` (`npm run build`)
- **Backend** — FastAPI (`backend/`); API under `/api`, serves `dist/` in production
- **Data** — Unity Catalog tables on a Databricks SQL warehouse (configure via env vars)
- **Layout** — Scorecard-style app shell (`src/components/layout/AppShell.tsx`)

## Prerequisites

- Node.js 20+
- Python 3.11+
- Databricks SQL warehouse + personal access token

## Provision metadata tables (first deploy)

App metadata lives in Unity Catalog:

| Default | Value |
|---------|-------|
| Catalog | `serverless_stable_tgnklq_catalog` |
| Schema | `data_collector` |

Tables created: `projects`, `project_members`, `field_definitions`, `form_layouts`, `schema_versions`, `record_audit_log`.

### Python script (recommended — no Databricks CLI)

```bash
python3 -m venv .venv
PIP_CONFIG_FILE=pip.conf .venv/bin/pip install -r requirements.txt

./scripts/setup.sh \
  --host "https://<workspace>.cloud.databricks.com" \
  --token "dapi..." \
  --warehouse-id "<warehouse-id>"
```

Use `./scripts/setup.sh` (or `.venv/bin/python3 scripts/setup.py`) so the correct venv is used.
Plain `python3` may point at a different interpreter without the Databricks packages installed.

Or set env vars / `.env` and run with defaults:

```bash
cp .env.example .env   # edit HOST, TOKEN, WAREHOUSE_ID
python scripts/setup.py
```

Override catalog/schema:

```bash
python scripts/setup.py --catalog serverless_stable_tgnklq_catalog --schema data_collector
```

### SQL editor (no Python connection)

```bash
python scripts/setup.py --emit-sql   # writes sql/schema.sql
```

Run `sql/schema.sql` in a Databricks SQL warehouse or notebook.

## Quick start (local)

```bash
# Install dependencies (Databricks internal PyPI proxy — see pip.conf)
python3 -m venv .venv && source .venv/bin/activate
PIP_CONFIG_FILE=pip.conf pip install -r requirements.txt
npm install

# Configure
cp .env.example .env
# Edit: DATABRICKS_HOST, DATABRICKS_TOKEN, DATABRICKS_WAREHOUSE_ID

# Run backend + frontend together
npm run dev:all
```

Open http://localhost:5173 — Vite proxies `/api` to port 8000.

## Layout

The app shell matches DHS Scorecard:

| Element | Behavior |
|---------|----------|
| Sidebar | Navy gradient, collapsible, DHS wordmark/seal |
| Header bar | `DhsSiteHeader` with route title and tagline |
| Dark/light toggle | Content area only — sidebar and header stay navy |
| Colors | DHS brand tokens in `src/assets/dhs-brand.css` |

## Project structure

```
data-collector/
├── backend/
│   ├── schema_ddl.py     # Metadata table DDL (single source of truth)
│   └── provisioning.py   # Execute DDL against SQL warehouse
├── sql/schema.sql        # Generated DDL for SQL editor / CLI
├── scripts/
│   ├── setup.py          # Provision metadata via SQL warehouse
│   ├── setup.sh
│   └── deploy.sh         # Bundle deploy to /Workspace/DBRX-Apps
├── resources/data-collector.app.yml
├── databricks.yml        # Asset bundle config
├── src/
│   ├── components/
│   │   ├── brand/        # DhsSiteHeader
│   │   └── layout/       # AppShell (Scorecard layout)
│   ├── assets/           # DHS brand CSS + content theme
│   └── hooks/            # useContentTheme
├── public/images/        # DHS logo + wordmark SVGs
├── scripts/dev.sh        # Local dev (backend + frontend)
├── app.yaml              # Databricks App entry
└── requirements.txt
```

## Deploy to Databricks Apps

Based on the **dhs-ophammer** bundle flow. One script builds, creates the workspace folder, and deploys.

### 1. Configure workspace auth

Edit `databricks.yml` → set `targets.dev.workspace.host` (and `targets.prod` profile/host if needed).

Create a Databricks CLI profile (one-time):

```bash
echo "dapi<your-token>" | databricks configure \
  --host "https://<workspace>.cloud.databricks.com" \
  --profile data-collector
```

In `.env`:

```bash
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
DATABRICKS_TOKEN=dapi...
DATABRICKS_WAREHOUSE_ID=<warehouse-id>
DATABRICKS_CONFIG_PROFILE=data-collector

# Optional — default /Workspace/DBRX-Apps (created automatically)
DATABRICKS_DEPLOY_FOLDER=/Workspace/DBRX-Apps
```

`deploy.sh` syncs `DATABRICKS_WAREHOUSE_ID` into `app.yaml` before each deploy.

Provision metadata tables first (once per workspace):

```bash
./scripts/setup.sh
```

### 2. Deploy the app

```bash
npm run deploy          # dev → /Workspace/DBRX-Apps/data-collector/dev/<your-email>
npm run deploy:prod     # prod
```

The script will:

1. `mkdirs` the deploy folder (e.g. `/Workspace/DBRX-Apps`)
2. `npm run build`
3. `databricks bundle validate` → `deploy` → `run`

### 3. Grant Unity Catalog permissions (required)

The deployed app runs as a **service principal**, not your user token. Without UC grants, `/api/projects` returns **Internal Server Error** (`USE CATALOG` denied).

**Find the service principal client id:**

1. **Compute → Apps →** your app (e.g. `data-collector-prod`)
2. Open the **Authorization** or app details tab
3. Copy **Service principal client ID** (UUID, e.g. `b73ec2ef-401b-47f4-8ca9-b7a2790320a5`)

Or via CLI:

```bash
databricks apps get data-collector-prod -p data-collector -o json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['service_principal_client_id'])"
```

**Run grants in a SQL warehouse** (replace catalog/schema and principal id):

```sql
-- App metadata schema (projects, fields, members, lookups)
GRANT USE CATALOG ON CATALOG serverless_stable_tgnklq_catalog TO `<service-principal-client-id>`;
GRANT USE SCHEMA ON SCHEMA serverless_stable_tgnklq_catalog.data_collector TO `<service-principal-client-id>`;
GRANT SELECT, MODIFY ON SCHEMA serverless_stable_tgnklq_catalog.data_collector TO `<service-principal-client-id>`;

-- Collection data schemas (repeat for each schema that holds published record tables)
GRANT USE SCHEMA ON SCHEMA serverless_stable_tgnklq_catalog.openfema TO `<service-principal-client-id>`;
GRANT SELECT, MODIFY ON SCHEMA serverless_stable_tgnklq_catalog.openfema TO `<service-principal-client-id>`;
```

Use the **client id UUID** in backticks — the display name (`app-xxxxx data-collector-prod`) often fails in `GRANT` statements.

**Grant users access to the app:** Compute → Apps → your app → **Permissions** → add users/groups with **Can use**.

### 4. Add Lakebase database resource (optional)

Required only if you want collections with **Storage → Lakebase (Postgres)**. App metadata still lives in UC Delta; record tables can live in Lakebase.

1. Create a **Lakebase Postgres** project in the workspace (app switcher → Lakebase Postgres).
2. **Compute → Apps →** your app → **Edit**
3. **App resources → + Add resource → Database**
4. Select your Lakebase project, branch (e.g. `production`), and database (`databricks_postgres`)
5. Permission: **Can connect and create**
6. Resource key: keep default **`database`** (must match `app.yaml` `valueFrom: database`)

`app.yaml` already includes:

```yaml
env:
  - name: ENDPOINT_NAME
    valueFrom: database
  - name: LAKEBASE_DEFAULT_SCHEMA
    value: data_collector
```

Databricks injects `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPORT`, `PGSSLMODE`. `ENDPOINT_NAME` is resolved from the database resource for OAuth token rotation.

7. **Redeploy** after adding the resource:

```bash
npm run deploy:prod
```

8. **Verify:** open the app → **Settings** → `Lakebase configured` should be **yes**.

See [docs/LAKEBASE.md](docs/LAKEBASE.md) for local dev connection vars and limitations (Genie is UC-only).

### 5. Post-deploy checklist

| Step | Verify |
|------|--------|
| UC grants on metadata schema | Collections page loads (no Internal Server Error) |
| App permissions for your user | You can open the app URL |
| SQL warehouse bound | Settings shows warehouse id / `db_status: ok` |
| Lakebase resource (if used) | Settings shows `Lakebase configured: yes` |
| Collection membership | Your workspace email is a project member (not only `local-dev@example.com`) |

For local dev, set `DEV_USER_EMAIL=you@company.com` in `.env` so collections match the deployed app identity.

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| `CLI_ARGS unbound variable` on macOS | Fixed in `deploy.sh` — pull latest |
| `openpgp: key expired` on bundle deploy | Upgrade Databricks CLI or use system Terraform (`DATABRICKS_TF_EXEC_PATH`) |
| Internal Server Error on Collections | UC grants for service principal client id |
| Empty collections in prod | Add your email to `project_members` or set `DEV_USER_EMAIL` locally |
| Lakebase option fails on create | Add database app resource + redeploy; check Settings |

## Related documentation

- [docs/LAKEBASE.md](docs/LAKEBASE.md) — Lakebase Postgres storage setup
- [docs/PRODUCT_PLAN.md](docs/PRODUCT_PLAN.md) — full product plan (lookups, AI builder, roadmap)
- [docs/ROADMAP.md](docs/ROADMAP.md) — implementation checklist

## License

Internal use unless otherwise specified.
