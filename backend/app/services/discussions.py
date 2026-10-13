from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Discussion
from app.schemas import DiscussionCreate
from app.services.leads import get_lead


def list_discussions(db: Session, lead_id: int) -> list[Discussion]:
    get_lead(db, lead_id)
    stmt = (
        select(Discussion)
        .where(Discussion.lead_id == lead_id)
        .order_by(Discussion.created_at.desc(), Discussion.id.desc())
    )
    return list(db.scalars(stmt))


def create_discussion(db: Session, lead_id: int, payload: DiscussionCreate) -> Discussion:
    lead = get_lead(db, lead_id)
    discussion = Discussion(lead_id=lead.id, note=payload.note, follow_up_at=payload.follow_up_at)
    db.add(discussion)
    # The lead keeps its current follow-up unless this discussion sets a new one.
    if payload.follow_up_at is not None:
        lead.next_follow_up_at = payload.follow_up_at
    db.commit()
    db.refresh(discussion)
    return discussion
