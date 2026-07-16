"""App-level administrator checks (distinct from collection project admin)."""

from __future__ import annotations

import os


def app_admin_emails() -> set[str]:
    raw = os.environ.get("APP_ADMIN_EMAILS", "")
    return {email.strip().lower() for email in raw.split(",") if email.strip()}


def is_app_admin(email: str) -> bool:
    if not email:
        return False
    return email.strip().lower() in app_admin_emails()
