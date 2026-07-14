"""Central configuration for Data Collector's Databricks connection and Unity Catalog target."""
import os
import re

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

CATALOG = os.environ.get("DATABRICKS_CATALOG", "main")
SCHEMA = os.environ.get("DATABRICKS_SCHEMA", "data_collector")

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

SCHEMA_FQN = f"{CATALOG}.{SCHEMA}"


def t(table: str) -> str:
    return (
        f"{quote_identifier(CATALOG)}.{quote_identifier(SCHEMA)}."
        f"{quote_identifier(table)}"
    )


def warehouse_http_path() -> str:
    path = os.environ.get("DATABRICKS_SQL_WAREHOUSE_HTTP_PATH")
    if not path:
        raise RuntimeError(
            "DATABRICKS_SQL_WAREHOUSE_HTTP_PATH is not set. Copy .env.example to .env "
            "and set your warehouse path (e.g. /sql/1.0/warehouses/<id>)."
        )
    return path
