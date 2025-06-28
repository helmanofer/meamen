from typing import Optional, Any, List
from sqlmodel import Session, select
from meamen.models.trainer import Trainer


def get_trainers(db: Session, skip: int = 0, limit: int = 100) -> List[Trainer]:
    statement = select(Trainer).offset(skip).limit(limit)
    result = db.exec(statement)
    return result.all()


def create_trainer(db: Session, trainer: Trainer) -> Trainer:
    db.add(trainer)
    db.commit()
    db.refresh(trainer)
    return trainer


def get_trainer_by_id(db: Session, trainer_id: int) -> Optional[Trainer]:
    statement = select(Trainer).where(Trainer.id == trainer_id)
    result = db.exec(statement)
    return result.first()


def update_trainer(
    db: Session, trainer_id: int, trainer_data: dict[str, Any]
) -> Optional[Trainer]:
    trainer = get_trainer_by_id(db, trainer_id)
    if not trainer:
        return None
    for key, value in trainer_data.items():
        setattr(trainer, key, value)
    db.add(trainer)
    db.commit()
    db.refresh(trainer)
    return trainer


def delete_trainer(db: Session, trainer_id: int) -> bool:
    trainer = get_trainer_by_id(db, trainer_id)
    if not trainer:
        return False
    db.delete(trainer)
    db.commit()
    return True
