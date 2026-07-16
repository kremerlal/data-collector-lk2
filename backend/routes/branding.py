"""App branding settings (logo, title, colors)."""

from __future__ import annotations

from fastapi import APIRouter, Request

from backend import branding_repository
from backend.branding_defaults import DEFAULT_BRANDING
from backend.deps import require_app_admin
from backend.models import BrandingConfig, BrandingUpdateRequest

router = APIRouter()


@router.get("/branding", response_model=BrandingConfig)
def get_branding() -> BrandingConfig:
    return BrandingConfig.model_validate(branding_repository.get_branding())


@router.put("/branding", response_model=BrandingConfig)
def update_branding(request: Request, body: BrandingUpdateRequest) -> BrandingConfig:
    email = require_app_admin(request)
    updates = body.model_dump(exclude_unset=True)
    if body.clear_logo:
        updates["logo_data_url"] = None
    updates.pop("clear_logo", None)
    if not updates:
        return BrandingConfig.model_validate(branding_repository.get_branding())
    saved = branding_repository.save_branding(updates, email)
    return BrandingConfig.model_validate(saved)


@router.post("/branding/reset", response_model=BrandingConfig)
def reset_branding(request: Request) -> BrandingConfig:
    email = require_app_admin(request)
    saved = branding_repository.save_branding(DEFAULT_BRANDING, email)
    return BrandingConfig.model_validate(saved)
