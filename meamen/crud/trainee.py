from typing import Optional, Any
from datetime import datetime, timezone
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from meamen.models.trainee import Trainee
from meamen.schemas.trainee import TraineeUpdate


from typing import Sequence

async def get_trainees(
    session: AsyncSession, trainer_id: int, skip: int = 0, limit: int = 100
) -> Sequence[Trainee]:
    statement = (
        select(Trainee)
        .where(Trainee.trainer_id == trainer_id)
        .offset(skip)
        .limit(limit)
    )
    result = await session.execute(statement)
    return result.scalars().all()


async def get_trainee_by_id(session: AsyncSession, trainee_id: int, trainer_id: int) -> Optional[Trainee]:
    statement = select(Trainee).where(
        Trainee.id == trainee_id, 
        Trainee.trainer_id == trainer_id
    )
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def create_trainee(session: AsyncSession, trainee: Trainee) -> Trainee:
    session.add(trainee)
    await session.commit()
    await session.refresh(trainee)
    return trainee


async def update_trainee(
    session: AsyncSession, trainee_id: int, trainer_id: int, trainee_update: TraineeUpdate
) -> Optional[Trainee]:
    trainee = await get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return None
    
    update_data = trainee_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trainee, field, value)
    
    trainee.updated_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(trainee)
    return trainee


async def delete_trainee(session: AsyncSession, trainee_id: int, trainer_id: int) -> bool:
    trainee = await get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return False
    
    await session.delete(trainee)
    await session.commit()
    return True


async def add_measurement_record(
    session: AsyncSession, trainee_id: int, trainer_id: int, measurement_data: dict[str, Any]
) -> Optional[Trainee]:
    trainee = await get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return None
    
    if not trainee.measurement_history:
        trainee.measurement_history = []
    
    trainee.measurement_history.append(measurement_data)
    trainee.updated_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(trainee)
    return trainee


async def add_progress_photo(
    session: AsyncSession, trainee_id: int, trainer_id: int, photo_data: dict[str, Any]
) -> Optional[Trainee]:
    trainee = await get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return None
    
    if not trainee.progress_photos:
        trainee.progress_photos = []
    
    trainee.progress_photos.append(photo_data)
    trainee.updated_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(trainee)
    return trainee
