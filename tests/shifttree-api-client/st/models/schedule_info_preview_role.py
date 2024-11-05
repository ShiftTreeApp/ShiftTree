from typing import Literal, Set, cast

ScheduleInfoPreviewRole = Literal["manager", "member", "owner"]

SCHEDULE_INFO_PREVIEW_ROLE_VALUES: Set[ScheduleInfoPreviewRole] = {
    "manager",
    "member",
    "owner",
}


def check_schedule_info_preview_role(value: str) -> ScheduleInfoPreviewRole:
    if value in SCHEDULE_INFO_PREVIEW_ROLE_VALUES:
        return cast(ScheduleInfoPreviewRole, value)
    raise TypeError(f"Unexpected value {value!r}. Expected one of {SCHEDULE_INFO_PREVIEW_ROLE_VALUES!r}")
