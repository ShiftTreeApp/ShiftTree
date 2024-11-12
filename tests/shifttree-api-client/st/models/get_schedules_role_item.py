from typing import Literal, Set, cast

GetSchedulesRoleItem = Literal["manager", "member", "owner"]

GET_SCHEDULES_ROLE_ITEM_VALUES: Set[GetSchedulesRoleItem] = {
    "manager",
    "member",
    "owner",
}


def check_get_schedules_role_item(value: str) -> GetSchedulesRoleItem:
    if value in GET_SCHEDULES_ROLE_ITEM_VALUES:
        return cast(GetSchedulesRoleItem, value)
    raise TypeError(f"Unexpected value {value!r}. Expected one of {GET_SCHEDULES_ROLE_ITEM_VALUES!r}")
