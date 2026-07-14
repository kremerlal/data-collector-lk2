from fastapi import APIRouter, Request

from backend import auth
from backend.models import UserInfo

router = APIRouter()


@router.get("/me", response_model=UserInfo)
def current_user(request: Request) -> UserInfo:
    return UserInfo(
        email=auth.get_user_email(request),
        display_name=auth.get_display_name(request),
    )
