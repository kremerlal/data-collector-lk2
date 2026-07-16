from fastapi import APIRouter, Request

from backend import auth
from backend.app_admin import is_app_admin
from backend.models import UserInfo

router = APIRouter()


@router.get("/me", response_model=UserInfo)
def current_user(request: Request) -> UserInfo:
    email = auth.get_user_email(request)
    return UserInfo(
        email=email,
        display_name=auth.get_display_name(request),
        is_app_admin=is_app_admin(email),
    )
