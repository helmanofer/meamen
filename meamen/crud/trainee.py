from typing import List
from sqlmodel import select
from meamen.models.trainee import Trainee


async def get_trainees(
    session, trainer_id: int, skip: int = 0, limit: int = 100
) -> List[Trainee]:
    statement = (
        select(Trainee)
        .where(Trainee.trainer_id == trainer_id)
        .offset(skip)
        .limit(limit)
    )
    result = await session.execute(statement)
    return result.scalars().all()


async def create_trainee(session, trainee: Trainee) -> Trainee:
    session.add(trainee)
    await session.commit()
    await session.refresh(trainee)
    return trainee
