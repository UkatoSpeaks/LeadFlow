from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Discussion
from app.schemas import DiscussionCreate, DiscussionRead
from app.services import discussions as discussion_service

router = APIRouter(prefix="/leads/{lead_id}/discussions", tags=["discussions"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[DiscussionRead])
def list_discussions(lead_id: int, db: DbSession) -> list[Discussion]:
    return discussion_service.list_discussions(db, lead_id)


@router.post("", response_model=DiscussionRead, status_code=status.HTTP_201_CREATED)
def create_discussion(lead_id: int, payload: DiscussionCreate, db: DbSession) -> Discussion:
    return discussion_service.create_discussion(db, lead_id, payload)
