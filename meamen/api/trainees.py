from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from meamen.db.session import get_session
from meamen.models.trainee import Trainee
from meamen.schemas.trainee import (
    TraineeCreate,
    TraineeRead,
    TraineeUpdate,
    MeasurementRecord,
    ProgressPhoto,
    ProgramAssignment
)
from meamen.crud.trainee import (
    get_trainees,
    get_trainee_by_id,
    create_trainee,
    update_trainee,
    delete_trainee,
    add_measurement_record,
    add_progress_photo,
    assign_program_to_trainee as assign_program,
    unassign_program_from_trainee as unassign_program,
    get_trainee_programs
)

router = APIRouter(prefix="/trainees", tags=["trainees"])


@router.get("/", response_model=List[TraineeRead])
def read_trainees(
    trainer_id: int,
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
):
    """Get all trainees for a specific trainer"""
    return get_trainees(session, trainer_id, skip, limit)


@router.get("/{trainee_id}", response_model=TraineeRead)
def read_trainee(
    trainee_id: int,
    trainer_id: int,
    session: Session = Depends(get_session),
):
    """Get a specific trainee by ID"""
    trainee = get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return trainee



@router.post("/", response_model=TraineeRead, status_code=status.HTTP_201_CREATED)
def add_trainee(
    trainee: TraineeCreate,
    trainer_id: int,
    session: Session = Depends(get_session)
):
    """Create a new trainee"""
    db_trainee = Trainee(**trainee.model_dump(), trainer_id=trainer_id)
    return create_trainee(session, db_trainee)


@router.put("/{trainee_id}", response_model=TraineeRead)
def modify_trainee(
    trainee_id: int,
    trainer_id: int,
    trainee_update: TraineeUpdate,
    session: Session = Depends(get_session),
):
    """Update a trainee's information"""
    trainee = update_trainee(session, trainee_id, trainer_id, trainee_update)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return trainee


@router.delete("/{trainee_id}")
def remove_trainee(
    trainee_id: int,
    trainer_id: int,
    session: Session = Depends(get_session),
):
    """Delete a trainee"""
    success = delete_trainee(session, trainee_id, trainer_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return {"message": "Trainee deleted successfully"}


@router.post("/{trainee_id}/measurements", response_model=TraineeRead)
def add_trainee_measurement(
    trainee_id: int,
    trainer_id: int,
    measurement: MeasurementRecord,
    session: Session = Depends(get_session),
):
    """Add a new measurement record for a trainee"""
    trainee = add_measurement_record(
        session, trainee_id, trainer_id, measurement.model_dump()
    )
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return trainee


@router.post("/{trainee_id}/photos", response_model=TraineeRead)
def add_trainee_photo(
    trainee_id: int,
    trainer_id: int,
    photo: ProgressPhoto,
    session: Session = Depends(get_session),
):
    """Add a new progress photo for a trainee"""
    trainee = add_progress_photo(
        session, trainee_id, trainer_id, photo.model_dump()
    )
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return trainee


@router.post("/{trainee_id}/assign-program", response_model=TraineeRead)
def assign_program_to_trainee_endpoint(
    trainee_id: int,
    trainer_id: int,
    assignment: ProgramAssignment,
    session: Session = Depends(get_session),
):
    """Assign a program to a trainee"""
    trainee = assign_program(session, trainee_id, trainer_id, assignment.program_id)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee or program not found"
        )
    return trainee


@router.delete("/{trainee_id}/unassign-program/{program_id}", response_model=TraineeRead)
def unassign_program_from_trainee_endpoint(
    trainee_id: int,
    program_id: int,
    trainer_id: int,
    session: Session = Depends(get_session),
):
    """Unassign a specific program from a trainee"""
    trainee = unassign_program(session, trainee_id, trainer_id, program_id)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return trainee


@router.get("/{trainee_id}/programs")
def get_trainee_programs_endpoint(
    trainee_id: int,
    trainer_id: int,
    session: Session = Depends(get_session),
):
    """Get all programs assigned to a trainee"""
    programs = get_trainee_programs(session, trainee_id, trainer_id)
    return programs
