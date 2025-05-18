from typing import List, Optional
from sqlmodel import select
from meamen.models.exercise import Exercise


async def get_exercises(session, skip: int = 0, limit: int = 100) -> List[Exercise]:
    statement = select(Exercise).offset(skip).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()


async def get_exercise_by_id(session, exercise_id: int) -> Optional[Exercise]:
    statement = select(Exercise).where(Exercise.id == exercise_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def create_exercise(session, exercise: Exercise) -> Exercise:
    session.add(exercise)
    await session.commit()
    await session.refresh(exercise)
    return exercise


async def update_exercise(
    session, exercise_id: int, exercise_data: dict
) -> Optional[Exercise]:
    exercise = await get_exercise_by_id(session, exercise_id)
    if not exercise:
        return None
    for key, value in exercise_data.items():
        setattr(exercise, key, value)
    await session.commit()
    await session.refresh(exercise)
    return exercise


async def delete_exercise(session, exercise_id: int) -> bool:
    exercise = await get_exercise_by_id(session, exercise_id)
    if not exercise:
        return False
    await session.delete(exercise)
    await session.commit()
    return True
