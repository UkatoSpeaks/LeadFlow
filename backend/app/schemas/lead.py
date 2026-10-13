from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints, field_validator

from app.models.lead import LeadStatus

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Company = Annotated[str, StringConstraints(strip_whitespace=True, max_length=120)]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, max_length=30)]


class LeadCreate(BaseModel):
    name: Name
    company: Company | None = None
    phone: Phone | None = None
    status: LeadStatus = LeadStatus.NEW

    @field_validator("company", "phone")
    @classmethod
    def blank_to_none(cls, value: str | None) -> str | None:
        return value or None


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    company: str | None
    phone: str | None
    status: LeadStatus
    next_follow_up_at: datetime | None
    created_at: datetime
    updated_at: datetime
    # Derived from the lead's most recent discussion.
    last_note: str | None = None
    last_discussion_at: datetime | None = None
