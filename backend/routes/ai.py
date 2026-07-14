from fastapi import APIRouter, HTTPException, Request

from backend import ai_service, auth
from backend.deps import require_role
from backend.models import (
    ApplyLookupProposalRequest,
    ApplyProjectProposalRequest,
    CreateFromProposalRequest,
    GenerateLookupRequest,
    GenerateProjectRequest,
    LookupProposal,
    LookupTable,
    ProjectBlueprint,
    ProjectDetail,
    RefineProjectRequest,
)
from backend.routes.projects import _detail

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate-project", response_model=ProjectBlueprint)
def generate_project(body: GenerateProjectRequest, request: Request):
    user = auth.get_user_email(request)
    try:
        return ai_service.generate_project_blueprint(body, user)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {exc}") from exc


@router.post("/create-from-proposal", response_model=ProjectDetail, status_code=201)
def create_from_proposal(body: CreateFromProposalRequest, request: Request):
    user = auth.get_user_email(request)
    try:
        project = ai_service.create_project_from_proposal(body, user)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _detail(project["project_id"], "admin")


@router.post("/projects/{project_id}/generate-lookup", response_model=LookupProposal)
def generate_lookup_proposal_route(project_id: str, body: GenerateLookupRequest, request: Request):
    require_role(project_id, request, "admin")
    user = auth.get_user_email(request)
    try:
        return ai_service.generate_lookup_proposal(body, user, project_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {exc}") from exc


@router.post("/projects/{project_id}/apply-lookup", response_model=LookupTable)
def apply_lookup_proposal(project_id: str, body: ApplyLookupProposalRequest, request: Request):
    user, _ = require_role(project_id, request, "admin")
    try:
        return ai_service.apply_lookup_proposal(project_id, body, user)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/projects/{project_id}/refine", response_model=ProjectBlueprint)
def refine_project(project_id: str, body: RefineProjectRequest, request: Request):
    require_role(project_id, request, "admin")
    user = auth.get_user_email(request)
    try:
        return ai_service.refine_project_fields(body, user, project_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI refinement failed: {exc}") from exc


@router.post("/projects/{project_id}/apply-proposal", response_model=ProjectDetail)
def apply_proposal(project_id: str, body: ApplyProjectProposalRequest, request: Request):
    user, role = require_role(project_id, request, "admin")
    try:
        ai_service.apply_project_proposal(project_id, body, user)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _detail(project_id, role)
