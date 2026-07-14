"""Central configuration for Data Collector's Databricks connection and Unity Catalog target."""
import os
import re

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

CATALOG = os.environ.get("DATABRICKS_CATALOG", "serverless_stable_tgnklq_catalog")
SCHEMA = os.environ.get("DATABRICKS_SCHEMA", "data_collector")
# Default location for new collection data tables (can differ from app metadata catalog/schema).
DEFAULT_DATA_CATALOG = os.environ.get("DATABRICKS_DEFAULT_DATA_CATALOG") or CATALOG
DEFAULT_DATA_SCHEMA = os.environ.get("DATABRICKS_DEFAULT_DATA_SCHEMA") or SCHEMA

_IDENTIFIER = re.compile(r"^[A-Za-z0-9_-]+$")
_UNQUOTED = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def _validate_identifier(name: str, label: str) -> str:
    if not _IDENTIFIER.match(name):
        raise ValueError(
            f"Invalid {label} '{name}'. Only letters, digits, underscores, and "
            f"hyphens are allowed (set DATABRICKS_{label.upper()} accordingly)."
        )
    return name


def quote_identifier(name: str) -> str:
    if _UNQUOTED.match(name):
        return name
    escaped = name.replace("`", "``")
    return f"`{escaped}`"


_validate_identifier(CATALOG, "catalog")
_validate_identifier(SCHEMA, "schema")
_validate_identifier(DEFAULT_DATA_CATALOG, "default data catalog")
_validate_identifier(DEFAULT_DATA_SCHEMA, "default data schema")

SCHEMA_FQN = f"{CATALOG}.{SCHEMA}"


def validate_identifier(name: str, label: str) -> str:
    """Validate a Unity Catalog identifier (catalog, schema, or table name)."""
    return _validate_identifier(name, label)


def table_fqn(catalog: str, schema: str, table: str) -> str:
    return (
        f"{quote_identifier(catalog)}.{quote_identifier(schema)}."
        f"{quote_identifier(table)}"
    )


def t(table: str) -> str:
    return (
        f"{quote_identifier(CATALOG)}.{quote_identifier(SCHEMA)}."
        f"{quote_identifier(table)}"
    )


def warehouse_http_path() -> str:
    path = os.environ.get("DATABRICKS_SQL_WAREHOUSE_HTTP_PATH")
    if path:
        return path
    wid = os.environ.get("DATABRICKS_WAREHOUSE_ID")
    if wid:
        return f"/sql/1.0/warehouses/{wid}"
    raise RuntimeError(
        "DATABRICKS_SQL_WAREHOUSE_HTTP_PATH or DATABRICKS_WAREHOUSE_ID is not set. "
        "Copy .env.example to .env and set one of them."
    )
