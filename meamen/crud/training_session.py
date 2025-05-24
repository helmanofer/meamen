from sqlmodel import select
from meamen.models.training_session import TrainingSession
from meamen.schemas.training_session import TrainingSessionCreate, TrainingSessionUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Sequence


async def create_training_session(
    db: AsyncSession, session_in: TrainingSessionCreate
) -> TrainingSession:
    session_obj = TrainingSession(**session_in.model_dump())
    db.add(session_obj)
    await db.commit()
    await db.refresh(session_obj)
    return session_obj


async def get_training_session(
    db: AsyncSession, session_id: int
) -> Optional[TrainingSession]:
    result = await db.execute(
        select(TrainingSession).where(TrainingSession.id == session_id)
    )
    return result.scalar_one_or_none()


async def get_training_sessions(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> Sequence[TrainingSession]:
    result = await db.execute(select(TrainingSession).offset(skip).limit(limit))
    return result.scalars().all()


async def update_training_session(
    db: AsyncSession, session_id: int, session_in: TrainingSessionUpdate
) -> Optional[TrainingSession]:
    session_obj = await get_training_session(db, session_id)
    if not session_obj:
        return None
    for field, value in session_in.model_dump(exclude_unset=True).items():
        setattr(session_obj, field, value)
    db.add(session_obj)
    await db.commit()
    await db.refresh(session_obj)
    return session_obj


async def delete_training_session(db: AsyncSession, session_id: int) -> bool:
    session_obj = await get_training_session(db, session_id)
    if not session_obj:
        return False
    await db.delete(session_obj)
    await db.commit()
    return True
