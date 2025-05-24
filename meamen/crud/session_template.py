from typing import Optional, Any, List
from sqlmodel import Session, select
from meamen.models.session_template import SessionTemplate


def get_session_templates(session: Session, skip: int = 0, limit: int = 100) -> List[SessionTemplate]:
    statement = select(SessionTemplate).offset(skip).limit(limit)
    result = session.exec(statement)
    return list(result.all())


def get_session_template_by_id(session: Session, template_id: int) -> Optional[SessionTemplate]:
    statement = select(SessionTemplate).where(SessionTemplate.id == template_id)
    result = session.exec(statement)
    return result.first()


def create_session_template(session: Session, template: SessionTemplate) -> SessionTemplate:
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


def update_session_template(
    session: Session, template_id: int, template_data: dict[str, Any]
) -> Optional[SessionTemplate]:
    template = get_session_template_by_id(session, template_id)
    if not template:
        return None
    for key, value in template_data.items():
        setattr(template, key, value)
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


def delete_session_template(session: Session, template_id: int) -> bool:
    template = get_session_template_by_id(session, template_id)
    if not template:
        return False
    session.delete(template)
    session.commit()
    return True
