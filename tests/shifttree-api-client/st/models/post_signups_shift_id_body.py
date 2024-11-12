from typing import Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="PostSignupsShiftIdBody")


@_attrs_define
class PostSignupsShiftIdBody:
    """
    Attributes:
        user_id (Union[Unset, str]): User to sign up, can only be another user if the current user is a manager
        weight (Union[Unset, float]): Weight of the user's preference for this shift
    """

    user_id: Union[Unset, str] = UNSET
    weight: Union[Unset, float] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        user_id = self.user_id

        weight = self.weight

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if user_id is not UNSET:
            field_dict["userId"] = user_id
        if weight is not UNSET:
            field_dict["weight"] = weight

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        user_id = d.pop("userId", UNSET)

        weight = d.pop("weight", UNSET)

        post_signups_shift_id_body = cls(
            user_id=user_id,
            weight=weight,
        )

        post_signups_shift_id_body.additional_properties = d
        return post_signups_shift_id_body

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
