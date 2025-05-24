from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
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
async def list_session_templates(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session)
):
    """Get all session templates."""
    templates = await get_session_templates(session, skip=skip, limit=limit)
    return templates


@router.get("/{template_id}", response_model=SessionTemplateRead)
async def get_session_template(
    template_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Get a specific session template by ID."""
    template = await get_session_template_by_id(session, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Session template not found")
    return template


@router.post("/", response_model=SessionTemplateRead)
async def create_new_session_template(
    template_data: SessionTemplateCreate,
    session: AsyncSession = Depends(get_session)
):
    """Create a new session template."""
    template = SessionTemplate(**template_data.model_dump())
    created_template = await create_session_template(session, template)
    return created_template


@router.put("/{template_id}", response_model=SessionTemplateRead)
async def update_existing_session_template(
    template_id: int,
    template_data: SessionTemplateUpdate,
    session: AsyncSession = Depends(get_session)
):
    """Update an existing session template."""
    updated_template = await update_session_template(
        session, template_id, template_data.model_dump(exclude_unset=True)
    )
    if not updated_template:
        raise HTTPException(status_code=404, detail="Session template not found")
    return updated_template


@router.delete("/{template_id}")
async def delete_existing_session_template(
    template_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Delete a session template."""
    success = await delete_session_template(session, template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session template not found")
    return {"message": "Session template deleted successfully"}