from datetime import datetime
from typing import Annotated

from pydantic import AwareDatetime, BaseModel, ConfigDict, StringConstraints

Note = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=5000)]


class DiscussionCreate(BaseModel):
    note: Note
    # Must include a timezone offset so "today" can be resolved correctly by the client.
    follow_up_at: AwareDatetime | None = None


class DiscussionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lead_id: int
    note: str
    follow_up_at: datetime | None
    created_at: datetime
