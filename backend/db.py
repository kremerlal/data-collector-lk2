from databricks import sql as dbsql
from databricks.sdk import WorkspaceClient

from backend import config


def get_connection():
    w = WorkspaceClient()
    return dbsql.connect(
        server_hostname=w.config.host,
        http_path=config.warehouse_http_path(),
        credentials_provider=lambda: w.config.authenticate,
    )
