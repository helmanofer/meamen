from typing import Optional, Any, Sequence
from uuid import UUID
from datetime import datetime, timezone
from sqlmodel import select, Session
from sqlalchemy.orm import selectinload
from meamen.models.trainee import Trainee, TraineeProgramAssignment
from meamen.schemas.trainee import TraineeUpdate

def get_trainees(
    session: Session, trainer_id: str, skip: int = 0, limit: int = 100
) -> Sequence[Trainee]:
    statement = (
        select(Trainee)
        .where(Trainee.trainer_id == trainer_id)
        .offset(skip)
        .limit(limit)
    )
    result = session.exec(statement)
    return result.all()


def get_trainee_by_id(session: Session, trainee_id: str, trainer_id: str) -> Optional[Trainee]:
    statement = select(Trainee).options(selectinload(Trainee.program_assignments)).where(
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
    session: Session, trainee_id: str, trainer_id: str, trainee_update: TraineeUpdate
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


def delete_trainee(session: Session, trainee_id: str, trainer_id: str) -> bool:
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return False

    session.delete(trainee)
    session.commit()
    return True


def add_measurement_record(
    session: Session, trainee_id: str, trainer_id: str, measurement_data: dict[str, Any]
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
    session: Session, trainee_id: str, trainer_id: str, photo_data: dict[str, Any]
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
    session: Session, trainee_id: str, trainer_id: str, program_id: str
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
    session: Session, trainee_id: str, trainer_id: str, program_id: UUID
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
    session: Session, trainee_id: str, trainer_id: str
) -> list[dict]:
    """Get all program assignments for a trainee with full program details"""
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        return []

    from meamen.models.session_template import SessionTemplate
    stmt = (
        select(TraineeProgramAssignment, SessionTemplate)
        .join(SessionTemplate, TraineeProgramAssignment.program_id == SessionTemplate.id)
        .where(
            TraineeProgramAssignment.trainee_id == trainee_id,
            TraineeProgramAssignment.status == "active"
        )
    )
    result = session.exec(stmt)
    
    programs = []
    for assignment, program in result.all():
        programs.append({
            "id": program.id,
            "name": program.name,
            "description": program.description,
            "category": program.category,
            "difficulty": program.difficulty,
            "duration_minutes": program.duration_minutes,
            "duration_weeks": None,  # This could be calculated or stored separately
            "equipment_needed": program.equipment_needed,
            "workout_structure": None,  # Not available in SessionTemplate model
            "notes": program.notes,
            "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
            "assignment_status": assignment.status,
            "assignment_notes": assignment.notes
        })
    
    return programs