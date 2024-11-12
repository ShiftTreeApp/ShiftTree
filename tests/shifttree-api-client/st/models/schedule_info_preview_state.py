from typing import Literal, Set, cast

ScheduleInfoPreviewState = Literal["closed", "open"]

SCHEDULE_INFO_PREVIEW_STATE_VALUES: Set[ScheduleInfoPreviewState] = {
    "closed",
    "open",
}


def check_schedule_info_preview_state(value: str) -> ScheduleInfoPreviewState:
    if value in SCHEDULE_INFO_PREVIEW_STATE_VALUES:
        return cast(ScheduleInfoPreviewState, value)
    raise TypeError(f"Unexpected value {value!r}. Expected one of {SCHEDULE_INFO_PREVIEW_STATE_VALUES!r}")
