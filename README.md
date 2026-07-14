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
- Databricks SQL warehouse and CLI auth (`databricks auth profiles`)

## Quick start (local)

```bash
# Install dependencies
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
npm install

# Configure
cp .env.example .env
# Edit: DATABRICKS_SQL_WAREHOUSE_HTTP_PATH, DATABRICKS_CATALOG, DATABRICKS_SCHEMA

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
├── backend/              # FastAPI (health, future data routes)
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

1. Build frontend: `npm run build`
2. Push to Git
3. Configure env vars in the Databricks App UI (`app.yaml` template)
4. Entry command: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

## License

Internal use unless otherwise specified.
