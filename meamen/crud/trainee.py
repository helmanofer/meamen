from typing import Optional, Any
from datetime import datetime, timezone
from sqlmodel import select, Session
from meamen.models.trainee import Trainee, TraineeProgramAssignment
from meamen.schemas.trainee import TraineeUpdate

from typing import Sequence

def get_trainees(
    session: Session, trainer_id: int, skip: int = 0, limit: int = 100
) -> Sequence[Trainee]:
    statement = (
        select(Trainee)
        .where(Trainee.trainer_id == trainer_id)
        .offset(skip)
        .limit(limit)
    )
    result = session.exec(statement)
    return result.all()


def get_trainee_by_id(session: Session, trainee_id: int, trainer_id: int) -> Optional[Trainee]:
    statement = select(Trainee).where(
        Trainee.id == trainee_id,
        Trainee.trainer_id == trainer_id
    )
    result = session.exec(statement)
    return result.first()


def create_trainee(session: Session, trainee: Trainee) -> Trainee:
    session.add(trainee)
    session.commit()
    session.refresh(trainee)
    return trainee


def update_trainee(
    session: Session, trainee_id: int, trainer_id: int, trainee_update: TraineeUpdate
) -> Optional[Trainee]:
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return None

    update_data = trainee_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trainee, field, value)

    trainee.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(trainee)
    return trainee


def delete_trainee(session: Session, trainee_id: int, trainer_id: int) -> bool:
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return False

    session.delete(trainee)
    session.commit()
    return True


def add_measurement_record(
    session: Session, trainee_id: int, trainer_id: int, measurement_data: dict[str, Any]
) -> Optional[Trainee]:
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return None

    if not trainee.measurement_history:
        trainee.measurement_history = []

    trainee.measurement_history.append(measurement_data)
    trainee.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(trainee)
    return trainee


def add_progress_photo(
    session: Session, trainee_id: int, trainer_id: int, photo_data: dict[str, Any]
) -> Optional[Trainee]:
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return None

    if not trainee.progress_photos:
        trainee.progress_photos = []

    trainee.progress_photos.append(photo_data)
    trainee.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(trainee)
    return trainee


def assign_program_to_trainee(
    session: Session, trainee_id: int, trainer_id: int, program_id: int
) -> Optional[Trainee]:
    """Assign a program to a trainee"""
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return None

    # Verify the program exists
    from meamen.models.session_template import SessionTemplate
    stmt = select(SessionTemplate).where(SessionTemplate.id == program_id)
    result = session.exec(stmt)
    program = result.first()

    if not program:
        return None

    # Check if assignment already exists
    existing_stmt = select(TraineeProgramAssignment).where(
        TraineeProgramAssignment.trainee_id == trainee_id,
        TraineeProgramAssignment.program_id == program_id,
        TraineeProgramAssignment.status == "active"
    )
    existing_result = session.exec(existing_stmt)
    existing_assignment = existing_result.first()

    if existing_assignment:
        return trainee  # Already assigned

    # Create new assignment
    assignment = TraineeProgramAssignment(
        trainee_id=trainee_id,
        program_id=program_id,
        status="active"
    )
    session.add(assignment)

    trainee.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(trainee)
    return trainee


def unassign_program_from_trainee(
    session: Session, trainee_id: int, trainer_id: int, program_id: int
) -> Optional[Trainee]:
    """Unassign a specific program from a trainee"""
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return None

    # Find the assignment to remove
    stmt = select(TraineeProgramAssignment).where(
        TraineeProgramAssignment.trainee_id == trainee_id,
        TraineeProgramAssignment.program_id == program_id,
        TraineeProgramAssignment.status == "active"
    )
    result = session.exec(stmt)
    assignment = result.first()

    if assignment:
        session.delete(assignment)

    trainee.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(trainee)
    return trainee


def get_trainee_programs(
    session: Session, trainee_id: int, trainer_id: int
) -> list[TraineeProgramAssignment]:
    """Get all program assignments for a trainee"""
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return []

    stmt = select(TraineeProgramAssignment).where(
        TraineeProgramAssignment.trainee_id == trainee_id,
        TraineeProgramAssignment.status == "active"
    )
    result = session.exec(stmt)
    return list(result.all())
