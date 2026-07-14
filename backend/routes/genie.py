from fastapi import APIRouter, HTTPException, Request

from backend import genie_service, repository
from backend.deps import require_role
from backend.models import GenieAskRequest, GenieAskResponse, GenieStatusResponse

router = APIRouter(prefix="/projects/{project_id}/genie", tags=["genie"])


def _project_or_404(project_id: str) -> dict:
    project = repository.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.get("storage_type") == "lakebase":
        raise HTTPException(
            status_code=400,
            detail="Genie Q&A is not available for Lakebase-backed collections (UC Delta only)",
        )
    return project


@router.get("/status", response_model=GenieStatusResponse)
def genie_status(project_id: str, request: Request):
    require_role(project_id, request, "reader")
    project = _project_or_404(project_id)
    return GenieStatusResponse(**genie_service.get_genie_status(project))


@router.post("/provision", response_model=GenieStatusResponse)
def provision_genie(project_id: str, request: Request):
    user, _ = require_role(project_id, request, "admin")
    project = _project_or_404(project_id)
    if project.get("status") != "published":
        raise HTTPException(status_code=400, detail="Collection must be published before provisioning Genie")
    genie_service.provision_genie_space(project_id, user)
    project = repository.get_project(project_id)
    return GenieStatusResponse(**genie_service.get_genie_status(project))  # type: ignore[arg-type]


@router.post("/ask", response_model=GenieAskResponse)
def ask_genie(project_id: str, body: GenieAskRequest, request: Request):
    require_role(project_id, request, "reader")
    project = _project_or_404(project_id)
    if project.get("status") != "published":
        raise HTTPException(status_code=400, detail="Collection must be published to ask questions")
    try:
        result = genie_service.ask_question(
            project,
            content=body.content,
            conversation_id=body.conversation_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Genie request failed: {exc}") from exc
    return GenieAskResponse(**result)
