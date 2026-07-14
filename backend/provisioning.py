"""Run Data Collector metadata DDL against a Databricks SQL warehouse."""

from backend.schema_ddl import ddl_statements, is_migration


def provision(cursor, catalog: str, schema: str) -> None:
    """Create schema and metadata tables if they do not exist."""
    for stmt in ddl_statements(catalog, schema):
        try:
            cursor.execute(stmt)
        except Exception as exc:
            if is_migration(stmt):
                print(f"  migration skipped (may already be applied): {exc}")
                continue
            raise
