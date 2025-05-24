from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from meamen.db.session import get_session
from meamen.models.session_template import SessionTemplate
from meamen.crud.session_template import (
    get_session_templates,
    get_session_template_by_id,
    create_session_template,
    update_session_template,
    delete_session_template
)
from meamen.schemas.session_template import (
    SessionTemplateCreate,
    SessionTemplateRead,
    SessionTemplateUpdate
)

router = APIRouter(prefix="/session-templates", tags=["session-templates"])


@router.get("/", response_model=List[SessionTemplateRead])
def list_session_templates(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Get all session templates."""
    templates = get_session_templates(session, skip=skip, limit=limit)
    return templates


@router.get("/{template_id}", response_model=SessionTemplateRead)
def get_session_template(
    template_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific session template by ID."""
    template = get_session_template_by_id(session, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Session template not found")
    return template


@router.post("/", response_model=SessionTemplateRead)
def create_new_session_template(
    template_data: SessionTemplateCreate,
    session: Session = Depends(get_session)
):
    """Create a new session template."""
    template = SessionTemplate(**template_data.model_dump())
    created_template = create_session_template(session, template)
    return created_template


@router.put("/{template_id}", response_model=SessionTemplateRead)
def update_existing_session_template(
    template_id: int,
    template_data: SessionTemplateUpdate,
    session: Session = Depends(get_session)
):
    """Update an existing session template."""
    updated_template = update_session_template(
        session, template_id, template_data.model_dump(exclude_unset=True)
    )
    if not updated_template:
        raise HTTPException(status_code=404, detail="Session template not found")
    return updated_template


@router.delete("/{template_id}")
def delete_existing_session_template(
    template_id: int,
    session: Session = Depends(get_session)
):
    """Delete a session template."""
    success = delete_session_template(session, template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session template not found")
    return {"message": "Session template deleted successfully"}
