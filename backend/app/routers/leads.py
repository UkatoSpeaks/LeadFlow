from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LeadStatus
from app.schemas import LeadCreate, LeadRead, LeadStatusUpdate
from app.services import leads as lead_service

router = APIRouter(prefix="/leads", tags=["leads"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[LeadRead])
def list_leads(
    db: DbSession,
    status: Annotated[LeadStatus | None, Query(description="Only return leads with this status")] = None,
    search: Annotated[str | None, Query(max_length=120, description="Match against the lead name")] = None,
) -> list[LeadRead]:
    return lead_service.list_leads(db, status=status, search=search)


@router.post("", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreate, db: DbSession) -> LeadRead:
    return lead_service.create_lead(db, payload)


@router.get("/{lead_id}", response_model=LeadRead)
def get_lead(lead_id: int, db: DbSession) -> LeadRead:
    return lead_service.get_lead_read(db, lead_id)


@router.patch("/{lead_id}", response_model=LeadRead)
def update_lead_status(lead_id: int, payload: LeadStatusUpdate, db: DbSession) -> LeadRead:
    return lead_service.update_lead_status(db, lead_id, payload)
