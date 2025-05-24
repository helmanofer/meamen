from typing import Optional, Any
from typing import List
from meamen.models.trainer import Trainer


def get_trainers(data_store: List[Trainer], skip: int = 0, limit: int = 100) -> List[Trainer]:
    return data_store[skip:skip + limit]


def create_trainer(data_store: List[Trainer], trainer: Trainer) -> Trainer:
    data_store.append(trainer)
    return trainer


def get_trainer_by_id(data_store: List[Trainer], trainer_id: int) -> Optional[Trainer]:
    for trainer in data_store:
        if trainer.id == trainer_id:
            return trainer
    return None


def update_trainer(
    data_store: List[Trainer], trainer_id: int, trainer_data: dict[str, Any]
) -> Optional[Trainer]:
    trainer = get_trainer_by_id(data_store, trainer_id)
    if not trainer:
        return None
    for key, value in trainer_data.items():
        setattr(trainer, key, value)
    return trainer


def delete_trainer(data_store: List[Trainer], trainer_id: int) -> bool:
    trainer = get_trainer_by_id(data_store, trainer_id)
    if not trainer:
        return False
    data_store.remove(trainer)
    return True
