"""Default branding values matching the shipped DHS theme."""

from __future__ import annotations

from typing import Any

DEFAULT_BRANDING: dict[str, Any] = {
    "app_title": "Data Collector",
    "agency_name": "U.S. Department of Homeland Security",
    "logo_data_url": None,
    "chrome": {
        "header_background": "#0c2340",
        "header_mid": "#112e51",
        "header_accent": "#0078ae",
        "sidebar_background": "#0c2340",
        "sidebar_mid": "#112e51",
        "sidebar_end": "#0c2a46",
    },
    "light": {
        "primary": "#005288",
        "primary_light": "#0078ae",
        "primary_dark": "#0c2340",
        "secondary": "#c41230",
        "background": "#f8f9fb",
        "paper": "#ffffff",
        "text_primary": "#1b1b1b",
        "text_secondary": "#5c5c5c",
    },
    "dark": {
        "primary": "#7dd3fc",
        "primary_light": "#bae6fd",
        "primary_dark": "#005288",
        "secondary": "#e03a52",
        "background": "#0c2340",
        "paper": "#112e51",
        "text_primary": "rgba(255, 255, 255, 0.96)",
        "text_secondary": "rgba(255, 255, 255, 0.76)",
    },
}
