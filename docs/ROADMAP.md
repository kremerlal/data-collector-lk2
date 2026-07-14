# Roadmap checklist

Track implementation against [PRODUCT_PLAN.md](./PRODUCT_PLAN.md).

## Phase 1 — MVP

- [x] Metadata DDL + `scripts/setup.py`
- [x] Projects CRUD + RBAC
- [x] Form designer (manual fields)
- [x] Publish to UC Delta + audit columns
- [x] Records table + form drawer
- [x] Members management
- [x] Scorecard app shell

## Phase 2 — Lookup tables

- [x] `lookup_tables` + `lookup_rows` DDL migration
- [x] Lookup CRUD API
- [x] Lookup manager UI
- [x] `lookup` field type (designer + records)
- [x] CSV import for lookups

## Phase 3 — AI-assisted builder

- [x] `ai_generation_log` DDL
- [x] Foundation Model API client
- [x] `POST /api/ai/generate-lookup`
- [x] `POST /api/ai/generate-project`
- [x] New project wizard (describe → draft)
- [x] AI side panel in project workspace
- [x] Apply/reject proposals

## Phase 4 — Advanced

- [x] UC table bind for lookups
- [x] Schema migration on re-publish
- [x] Field-level audit log
- [x] Genie for record Q&A
- [x] Lakebase storage (Postgres record tables via app resource)
- [x] Validation engine

## Phase 5 — Enterprise

- [ ] Publish approval workflow
- [ ] Anonymous forms
- [ ] Entra group → roles
- [x] Bulk record import/export
