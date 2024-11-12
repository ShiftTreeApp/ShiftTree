from collections.abc import Sequence
from datetime import datetime

from pydantic import BaseModel, Field

type ShiftId = str


type UserId = str


class Signup(BaseModel):
    weight: float = Field(default=1.0)
    user_id: UserId


class Shift(BaseModel):
    id: ShiftId
    start_time: datetime
    end_time: datetime
    signups: Sequence[Signup]


class ScheduleRequest(BaseModel):
    shifts: Sequence[Shift]


class Assignment(BaseModel):
    shift_id: ShiftId
    user_id: UserId
    requested_weight: float | None


class ScheduleResponse(BaseModel):
    assignments: Sequence[Assignment]


class Config(BaseModel):
    host: str = Field(default="::", validation_alias="SHIFTTREE_SCHEDULING_HOST")
    port: int = Field(default=8080, validation_alias="SHIFTTREE_SCHEDULING_PORT")
