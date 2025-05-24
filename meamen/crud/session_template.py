from typing import Optional, Any, Sequence
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from meamen.models.session_template import SessionTemplate


async def get_session_templates(session: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[SessionTemplate]:
    statement = select(SessionTemplate).offset(skip).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()


async def get_session_template_by_id(session: AsyncSession, template_id: int) -> Optional[SessionTemplate]:
    statement = select(SessionTemplate).where(SessionTemplate.id == template_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def create_session_template(session: AsyncSession, template: SessionTemplate) -> SessionTemplate:
    session.add(template)
    await session.commit()
    await session.refresh(template)
    return template


async def update_session_template(
    session: AsyncSession, template_id: int, template_data: dict[str, Any]
) -> Optional[SessionTemplate]:
    template = await get_session_template_by_id(session, template_id)
    if not template:
        return None
    for key, value in template_data.items():
        setattr(template, key, value)
    await session.commit()
    await session.refresh(template)
    return template


async def delete_session_template(session: AsyncSession, template_id: int) -> bool:
    template = await get_session_template_by_id(session, template_id)
    if not template:
        return False
    await session.delete(template)
    await session.commit()
    return True