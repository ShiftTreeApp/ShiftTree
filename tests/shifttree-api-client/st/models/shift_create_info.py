import datetime
from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field
from dateutil.parser import isoparse

from ..types import UNSET, Unset

T = TypeVar("T", bound="ShiftCreateInfo")


@_attrs_define
class ShiftCreateInfo:
    """
    Attributes:
        name (str):
        start_time (datetime.datetime):
        end_time (datetime.datetime):
        description (Union[Unset, str]):
    """

    name: str
    start_time: datetime.datetime
    end_time: datetime.datetime
    description: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        name = self.name

        start_time = self.start_time.isoformat()

        end_time = self.end_time.isoformat()

        description = self.description

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "name": name,
                "startTime": start_time,
                "endTime": end_time,
            }
        )
        if description is not UNSET:
            field_dict["description"] = description

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        name = d.pop("name")

        start_time = isoparse(d.pop("startTime"))

        end_time = isoparse(d.pop("endTime"))

        description = d.pop("description", UNSET)

        shift_create_info = cls(
            name=name,
            start_time=start_time,
            end_time=end_time,
            description=description,
        )

        shift_create_info.additional_properties = d
        return shift_create_info

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
