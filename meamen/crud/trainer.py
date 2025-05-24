from typing import Optional, Any, Sequence
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from meamen.models.trainer import Trainer


async def get_trainers(session: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[Trainer]:
    statement = select(Trainer).offset(skip).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()


async def create_trainer(session: AsyncSession, trainer: Trainer) -> Trainer:
    session.add(trainer)
    await session.commit()
    await session.refresh(trainer)
    return trainer


async def get_trainer_by_id(session: AsyncSession, trainer_id: int) -> Optional[Trainer]:
    statement = select(Trainer).where(Trainer.id == trainer_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def update_trainer(
    session: AsyncSession, trainer_id: int, trainer_data: dict[str, Any]
) -> Optional[Trainer]:
    trainer = await get_trainer_by_id(session, trainer_id)
    if not trainer:
        return None
    for key, value in trainer_data.items():
        setattr(trainer, key, value)
    await session.commit()
    await session.refresh(trainer)
    return trainer


async def delete_trainer(session: AsyncSession, trainer_id: int) -> bool:
    trainer = await get_trainer_by_id(session, trainer_id)
    if not trainer:
        return False
    await session.delete(trainer)
    await session.commit()
    return True
