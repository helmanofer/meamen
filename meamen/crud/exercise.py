from typing import Optional, Any, List
from sqlmodel import Session, select
from meamen.models.exercise import Exercise


def get_exercises(session: Session, skip: int = 0, limit: int = 100) -> List[Exercise]:
    statement = select(Exercise).offset(skip).limit(limit)
    result = session.exec(statement)
    return list(result.all())


def get_exercise_by_id(session: Session, exercise_id: int) -> Optional[Exercise]:
    statement = select(Exercise).where(Exercise.id == exercise_id)
    result = session.exec(statement)
    return result.first()


def create_exercise(session: Session, exercise: Exercise) -> Exercise:
    session.add(exercise)
    session.commit()
    session.refresh(exercise)
    return exercise


def update_exercise(
    session: Session, exercise_id: int, exercise_data: dict[str, Any]
) -> Optional[Exercise]:
    exercise = get_exercise_by_id(session, exercise_id)
    if not exercise:
        return None
    for key, value in exercise_data.items():
        setattr(exercise, key, value)
    session.add(exercise)
    session.commit()
    session.refresh(exercise)
    return exercise


def delete_exercise(session: Session, exercise_id: int) -> bool:
    exercise = get_exercise_by_id(session, exercise_id)
    if not exercise:
        return False
    session.delete(exercise)
    session.commit()
    return True
