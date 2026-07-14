# Data Collector — Product Plan

SharePoint List / Google Forms-style data collection on Databricks: admins design collections, editors enter data, readers view only. Data lands in **Unity Catalog** (Lakebase later). **AI assists** project setup and lookup generation.

## Defaults

| Setting | Value |
|---------|-------|
| Metadata catalog | `serverless_stable_tgnklq_catalog` |
| Metadata schema | `data_collector` |
| Per-project data table | `{catalog}.{schema}.{slug}_data` |

---

## Core concepts

| Concept | Description |
|---------|-------------|
| **Data Collection (Project)** | Named collection with schema, form layout, members, lookup tables, and a backing UC table |
| **Field Definition** | Name, type, validation, display config |
| **Lookup Table** | Per-project reference data (e.g. US states: code + name) |
| **Lookup Field** | Dropdown whose options come from a lookup table |
| **Record** | One row of collected data + audit columns |
| **Member Role** | `admin` · `editor` · `reader` |

### Roles

| Role | Capabilities |
|------|----------------|
| **admin** | Design schema/form, manage lookups, members, publish, delete project |
| **editor** | Create, edit, delete records |
| **reader** | View records only |

Identity: Databricks App login (proxy headers) or `DEV_USER_EMAIL` locally.

---

## Field types

| Type | UI | Notes |
|------|-----|-------|
| `text` | Single-line | min/max length, regex |
| `textarea` | Multi-line | max length |
| `number` | Number | min, max, integer |
| `date` / `datetime` | Date picker | min/max date |
| `boolean` | Checkbox | default |
| `single_select` | Dropdown | inline options |
| `multi_select` | Multi-select | inline options |
| `lookup` | Dropdown | **from lookup table** (value + display columns) |
| `email` / `url` | Text | format validation |

Every published data table includes system columns: `_record_id`, `_created_at`, `_created_by`, `_updated_at`, `_updated_by`.

---

## Lookup tables

### Purpose

Reusable reference data per project — states, agencies, severity codes — instead of pasting options into each field. Enables **AI-generated lookup lists** (e.g. "US states with abbreviations").

### Storage (phased)

| Phase | Approach |
|-------|----------|
| **2** | `lookup_tables` + `lookup_rows` in app metadata schema |
| **4** | Bind to existing UC tables; large lists in dedicated Delta tables |
| **4** | CSV import |

### Lookup field config

```json
{
  "field_type": "lookup",
  "config_json": {
    "lookup_id": "uuid",
    "value_column": "code",
    "display_column": "name",
    "allow_multiple": false
  }
}
```

---

## AI-assisted project builder

### User flow

```
1. Describe what to collect (free text)
2. AI generates draft: name, fields, lookup tables, validation hints
3. User edits in form designer + lookup manager (+ AI side panel)
4. Publish → UC Delta table + live form
```

### AI capabilities (phased)

| Capability | Phase |
|------------|-------|
| Generate lookup rows from prompt ("US states + abbreviations") | 3 |
| Generate full project blueprint from description | 3 |
| Refine fields / validation via chat | 3 |
| Suggest member roles | 3 |
| Genie: Q&A on collected records | 4 |
| AI from sample CSV column inference | 4 |

### Integration

- **Primary:** Databricks Foundation Model API (structured JSON output)
- **Not Genie-first** for schema generation (Genie is better for SQL/analytics; optional later for record insights)
- Admin-only **Apply** — AI never auto-publishes
- Audit: `ai_generation_log` table

### API (planned)

```
POST /api/ai/generate-project
POST /api/projects/{id}/ai/chat
POST /api/projects/{id}/ai/generate-lookup
POST /api/projects/{id}/ai/apply-proposal
```

---

## Metadata tables

| Table | Purpose |
|-------|---------|
| `projects` | Collection definition and UC target |
| `project_members` | RBAC |
| `field_definitions` | Form schema (draft + published versions) |
| `form_layouts` | Optional layout JSON |
| `schema_versions` | Publish history |
| `record_audit_log` | Field-level change log (future) |
| `lookup_tables` | Lookup definitions per project |
| `lookup_rows` | Lookup data rows |
| `ai_generation_log` | AI prompts/responses audit (phase 3) |

Provision: `python scripts/setup.py` (see README).

---

## UI structure

```
Dashboard
Collections
  └─ [Project]
       ├─ Form designer (+ AI panel, phase 3)
       ├─ Lookup tables (phase 2)
       ├─ Records (table + form drawer)
       └─ Members (admin)
Settings
Help
```

### New project wizard (phase 3)

1. **Describe** — what to collect  
2. **AI draft** — review generated fields + lookups  
3. **Edit** — designer, lookups, members  
4. **Publish**

---

## API summary (current + planned)

### Implemented (phase 1)

```
GET    /api/me
GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PATCH  /api/projects/{id}
GET    /api/projects/{id}/members
POST   /api/projects/{id}/members
DELETE /api/projects/{id}/members/{email}
GET    /api/projects/{id}/fields
PUT    /api/projects/{id}/fields
POST   /api/projects/{id}/publish
GET    /api/projects/{id}/records
POST   /api/projects/{id}/records
PATCH  /api/projects/{id}/records/{record_id}
```

### Phase 2 — Lookups

```
GET    /api/projects/{id}/lookups
POST   /api/projects/{id}/lookups
GET    /api/projects/{id}/lookups/{lookup_id}
PUT    /api/projects/{id}/lookups/{lookup_id}
DELETE /api/projects/{id}/lookups/{lookup_id}
GET    /api/projects/{id}/lookups/{lookup_id}/rows
PUT    /api/projects/{id}/lookups/{lookup_id}/rows
POST   /api/projects/{id}/lookups/{lookup_id}/import-csv
```

### Phase 3 — AI

See AI section above.

---

## Roadmap

### Phase 1 — MVP ✅

- Manual form designer, publish to UC Delta, records CRUD, RBAC, row audit columns
- Scorecard layout shell, Databricks App deploy scaffold

### Phase 2 — Lookup tables (in progress)

- Metadata DDL + CRUD API
- Lookup manager UI (grid editor)
- `lookup` field type in designer and record forms
- CSV import

### Phase 3 — AI-assisted builder

- Foundation Model API service
- New project wizard (describe → generate)
- AI generate lookup from natural language
- AI side panel in project workspace
- `ai_generation_log`

### Phase 4 — Advanced

- Bind lookups to UC tables
- Schema migration on re-publish (ALTER TABLE)
- Field-level audit log
- Genie integration for record analytics
- Lakebase storage adapter
- Server-side validation engine

### Phase 5 — Enterprise

- Approval workflows before publish
- Public/anonymous form links
- Entra ID group → role mapping
- Export / bulk import records

---

## Technical stack

| Layer | Choice |
|-------|--------|
| Frontend | React, Vite, MUI, React Router, MUI Data Grid |
| Backend | FastAPI, databricks-sql-connector |
| Metadata | Unity Catalog Delta (app schema) |
| Collection data | Unity Catalog Delta per project |
| AI (planned) | Databricks Foundation Model API |
| Deploy | Databricks App (`app.yaml`) |

---

## Open decisions

1. **Lookup size limit** — metadata JSON vs UC table threshold (suggest 2k rows in metadata)
2. **Re-publish** — ALTER TABLE for new columns vs new table version
3. **AI model** — which foundation model endpoint per workspace
4. **Delete policy** — editors vs admin-only record delete

---

## Related docs

- [README](../README.md) — local dev and provisioning
- [sql/schema.sql](../sql/schema.sql) — generated metadata DDL
