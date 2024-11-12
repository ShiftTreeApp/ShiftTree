from collections.abc import Mapping, Sequence
from datetime import datetime
from typing import Any, Literal

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


class Conflict(BaseModel):
    rule_name: str
    subjects: Mapping[str, Any]


class ScheduleResponse(BaseModel):
    conflicts: Sequence[Conflict]
    assignments: Sequence[Assignment]
    status: Literal["optimal", "infeasible"]


class Config(BaseModel):
    host: str = Field(default="::", validation_alias="SHIFTTREE_SCHEDULING_HOST")
    port: int = Field(default=8080, validation_alias="SHIFTTREE_SCHEDULING_PORT")
