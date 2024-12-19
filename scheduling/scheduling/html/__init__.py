from collections.abc import Sequence
from datetime import UTC, timedelta, tzinfo
from pathlib import Path
from typing import Annotated

try:
    import jinja2 as j2
except ImportError:
    raise ImportError("The `html` extra must be enabled to use this module")
from annotated_types import Len
from pydantic import BaseModel

from scheduling import models, schedule

_env = j2.Environment(
    loader=j2.DictLoader(
        {p.stem: p.read_text() for p in Path(__file__).parent.glob("*.j2")}
    )
)


class ShiftEvent(BaseModel):
    id: str
    start: str
    end: str
    end_day: str | None
    users: Sequence[str]


class CalendarCell(BaseModel):
    month_number: int
    month_name: str
    day_number: int
    shifts: Sequence[ShiftEvent]


class CalendarRow(BaseModel):
    cells: Annotated[Sequence[CalendarCell], Len(min_length=7, max_length=7)]


class TemplateContext(BaseModel):
    rows: Sequence[CalendarRow]


def wrap_weekday(day: int) -> int:
    return (day + 1) % 7


def render_schedule(
    *,
    request: schedule.Config,
    response: models.ScheduleResponse,
    output_tz: tzinfo = UTC,
) -> str:
    unique_dts = (
        set()
        | {shift.start_time for shift in request.shifts.values()}
        | {shift.end_time for shift in request.shifts.values()}
    )
    shifts_with_day = [
        ((dt.year, dt.month, dt.day), shift_id, shift, dt)
        for shift_id, shift, dt in (
            (shift_id, shift, shift.start_time.replace(tzinfo=output_tz))
            for shift_id, shift in request.shifts.items()
        )
    ]
    unique_days = {ymd for ymd, _, _, _ in shifts_with_day}
    cells = {
        ymd: [
            ShiftEvent(
                id=shift_id,
                start=dt.strftime("%H:%M"),
                end=shift.end_time.strftime("%H:%M"),
                end_day=None,
                users=[
                    a.user_id for a in response.assignments if a.shift_id == shift_id
                ],
            )
            for shift_ymd, shift_id, shift, dt in shifts_with_day
            if shift_ymd == ymd
        ]
        for ymd in unique_days
    }

    earliest = min(unique_dts)
    latest = max(unique_dts)
    start_day = earliest - timedelta(days=earliest.weekday())
    end_day = latest - timedelta(days=latest.weekday()) + timedelta(days=6)

    num_weeks = (end_day - start_day).days // 7 + 1

    rows = [
        CalendarRow(
            cells=[
                CalendarCell(
                    month_number=dt.month,
                    month_name=dt.strftime("%b"),
                    day_number=dt.day,
                    shifts=cells.get(
                        (dt.year, dt.month, dt.day),
                        [],
                    ),
                )
                for dt in (
                    start_day + timedelta(days=7 * week + day) for day in range(7)
                )
            ]
        )
        for week in range(num_weeks)
    ]

    ctx = TemplateContext(rows=rows)

    return _env.get_template("index.html").render(ctx.model_dump(mode="json"))
