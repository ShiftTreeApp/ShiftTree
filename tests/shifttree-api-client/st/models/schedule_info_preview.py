import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..models.schedule_info_preview_role import ScheduleInfoPreviewRole, check_schedule_info_preview_role
from ..models.schedule_info_preview_state import ScheduleInfoPreviewState, check_schedule_info_preview_state

if TYPE_CHECKING:
    from ..models.user_info_preview import UserInfoPreview


T = TypeVar("T", bound="ScheduleInfoPreview")


@_attrs_define
class ScheduleInfoPreview:
    """
    Attributes:
        id (UUID):
        name (str):
        description (str):
        owner (UserInfoPreview):
        start_time (Union[None, datetime.datetime]):
        end_time (Union[None, datetime.datetime]):
        role (ScheduleInfoPreviewRole):
        state (ScheduleInfoPreviewState):
    """

    id: UUID
    name: str
    description: str
    owner: "UserInfoPreview"
    start_time: Union[None, datetime.datetime]
    end_time: Union[None, datetime.datetime]
    role: ScheduleInfoPreviewRole
    state: ScheduleInfoPreviewState
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        id = str(self.id)

        name = self.name

        description = self.description

        owner = self.owner.to_dict()

        start_time: Union[None, str]
        if isinstance(self.start_time, datetime.datetime):
            start_time = self.start_time.isoformat()
        else:
            start_time = self.start_time

        end_time: Union[None, str]
        if isinstance(self.end_time, datetime.datetime):
            end_time = self.end_time.isoformat()
        else:
            end_time = self.end_time

        role: str = self.role

        state: str = self.state

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "name": name,
                "description": description,
                "owner": owner,
                "startTime": start_time,
                "endTime": end_time,
                "role": role,
                "state": state,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.user_info_preview import UserInfoPreview

        d = src_dict.copy()
        id = UUID(d.pop("id"))

        name = d.pop("name")

        description = d.pop("description")

        owner = UserInfoPreview.from_dict(d.pop("owner"))

        def _parse_start_time(data: object) -> Union[None, datetime.datetime]:
            if data is None:
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                start_time_type_0 = isoparse(data)

                return start_time_type_0
            except:  # noqa: E722
                pass
            return cast(Union[None, datetime.datetime], data)

        start_time = _parse_start_time(d.pop("startTime"))

        def _parse_end_time(data: object) -> Union[None, datetime.datetime]:
            if data is None:
                return data
            try:
                if not isinstance(data, str):
                    raise TypeError()
                end_time_type_0 = isoparse(data)

                return end_time_type_0
            except:  # noqa: E722
                pass
            return cast(Union[None, datetime.datetime], data)

        end_time = _parse_end_time(d.pop("endTime"))

        role = check_schedule_info_preview_role(d.pop("role"))

        state = check_schedule_info_preview_state(d.pop("state"))

        schedule_info_preview = cls(
            id=id,
            name=name,
            description=description,
            owner=owner,
            start_time=start_time,
            end_time=end_time,
            role=role,
            state=state,
        )

        schedule_info_preview.additional_properties = d
        return schedule_info_preview

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
