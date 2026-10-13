from datetime import datetime

from sqlalchemy import Select, and_, func, select
from sqlalchemy.orm import Session

from app.errors import NotFoundError
from app.models import Discussion, Lead, LeadStatus
from app.schemas import LeadCreate, LeadRead, LeadStatusUpdate


def _leads_with_last_discussion() -> Select:
    """Select each lead together with the note and time of its latest discussion."""
    ranked = select(
        Discussion.lead_id,
        Discussion.note,
        Discussion.created_at,
        func.row_number()
        .over(
            partition_by=Discussion.lead_id,
            order_by=(Discussion.created_at.desc(), Discussion.id.desc()),
        )
        .label("position"),
    ).subquery()

    return (
        select(Lead, ranked.c.note, ranked.c.created_at)
        .outerjoin(ranked, and_(ranked.c.lead_id == Lead.id, ranked.c.position == 1))
        # Most recently active leads first; leads with no discussions fall back to creation time.
        .order_by(func.coalesce(ranked.c.created_at, Lead.created_at).desc(), Lead.id.desc())
    )


def _to_read(lead: Lead, last_note: str | None, last_discussion_at: datetime | None) -> LeadRead:
    lead_read = LeadRead.model_validate(lead)
    lead_read.last_note = last_note
    lead_read.last_discussion_at = last_discussion_at
    return lead_read


def get_lead(db: Session, lead_id: int) -> Lead:
    lead = db.get(Lead, lead_id)
    if lead is None:
        raise NotFoundError(f"Lead {lead_id} not found")
    return lead


def get_lead_read(db: Session, lead_id: int) -> LeadRead:
    row = db.execute(_leads_with_last_discussion().where(Lead.id == lead_id)).first()
    if row is None:
        raise NotFoundError(f"Lead {lead_id} not found")
    return _to_read(*row)


def list_leads(db: Session, status: LeadStatus | None = None, search: str | None = None) -> list[LeadRead]:
    stmt = _leads_with_last_discussion()
    if status is not None:
        stmt = stmt.where(Lead.status == status)
    if search and search.strip():
        stmt = stmt.where(Lead.name.icontains(search.strip(), autoescape=True))
    return [_to_read(*row) for row in db.execute(stmt)]


def create_lead(db: Session, payload: LeadCreate) -> LeadRead:
    lead = Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return _to_read(lead, None, None)


def update_lead_status(db: Session, lead_id: int, payload: LeadStatusUpdate) -> LeadRead:
    lead = get_lead(db, lead_id)
    lead.status = payload.status
    db.commit()
    return get_lead_read(db, lead_id)
