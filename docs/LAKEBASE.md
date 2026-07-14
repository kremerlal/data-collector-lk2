# Lakebase storage for Data Collector

Collections can use **`storage_type: lakebase`** to store records in **Lakebase Postgres** instead of Unity Catalog Delta tables. App metadata (projects, fields, members, lookups) always stays in UC Delta.

Full deployment steps (UC grants, app permissions, Lakebase resource) are in [README.md](../README.md#deploy-to-databricks-apps).

## Deployed app (Databricks Apps)

### 1. Add the database app resource

1. Create a **Lakebase Postgres** project in the workspace (if you do not have one).
2. **Compute → Apps →** your app → **Edit**
3. **App resources → + Add resource → Database**
4. Select project, branch (e.g. `production`), and database (`databricks_postgres`)
5. Permission: **Can connect and create**
6. Resource key: **`database`** (must match `valueFrom` in `app.yaml`)

Databricks creates a Postgres role for the app's service principal and injects `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPORT`, `PGSSLMODE`.

### 2. Configure `app.yaml`

The repo ships with:

```yaml
env:
  - name: ENDPOINT_NAME
    valueFrom: database
  - name: LAKEBASE_DEFAULT_SCHEMA
    value: data_collector
```

`valueFrom: database` resolves to the Lakebase endpoint path (`projects/.../branches/.../endpoints/...`) at runtime — you do not need to copy it manually from the Connect dialog.

### 3. Redeploy

```bash
npm run deploy:prod
```

### 4. Verify

Open the app → **Settings**:

- `Lakebase configured: yes`
- `Lakebase database` shows your Postgres database name

## Manual `ENDPOINT_NAME` (optional)

If not using `valueFrom: database`, copy the resource name from Lakebase → your branch → **Computes** → **primary** → **Get ID** → **Copy resource name**, then set in `app.yaml`:

```yaml
  - name: ENDPOINT_NAME
    value: projects/<project-id>/branches/<branch-id>/endpoints/<endpoint-id>
```

The Connect dialog hostname (e.g. `ep-fancy-waterfall-....database....databricks.com`) is **not** the endpoint name.

## Local development

Add to `.env` (use **your email** as `PGUSER`, not the service principal client id):

```bash
PGHOST=ep-xxxx.database.us-east-2.cloud.databricks.com
PGDATABASE=databricks_postgres
PGUSER=you@company.com
PGPORT=5432
PGSSLMODE=require
ENDPOINT_NAME=projects/.../branches/.../endpoints/...
LAKEBASE_DEFAULT_SCHEMA=data_collector
```

Get `ENDPOINT_NAME` from Lakebase → Computes → **Get ID** → **Copy resource name**.

Install deps: `pip install -r requirements.txt` (includes `psycopg[binary,pool]`).

## Creating a Lakebase collection

1. **New collection** → Storage → **Lakebase (Postgres)**
2. Optionally customize **schema** and **table** name (database comes from `PGDATABASE`)
3. Design form → **Publish** (creates Postgres schema/table)

## Limitations (v1)

- **Genie Q&A** is disabled for Lakebase collections (requires UC Delta table)
- Lookups and metadata still use the SQL warehouse / UC metadata schema
