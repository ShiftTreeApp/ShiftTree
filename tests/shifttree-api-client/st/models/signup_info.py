from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.user_info_preview import UserInfoPreview


T = TypeVar("T", bound="SignupInfo")


@_attrs_define
class SignupInfo:
    """
    Attributes:
        user (Union[Unset, UserInfoPreview]):
        weight (Union[Unset, int]):
    """

    user: Union[Unset, "UserInfoPreview"] = UNSET
    weight: Union[Unset, int] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        user: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.user, Unset):
            user = self.user.to_dict()

        weight = self.weight

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({})
        if user is not UNSET:
            field_dict["user"] = user
        if weight is not UNSET:
            field_dict["weight"] = weight

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.user_info_preview import UserInfoPreview

        d = src_dict.copy()
        _user = d.pop("user", UNSET)
        user: Union[Unset, UserInfoPreview]
        if isinstance(_user, Unset):
            user = UNSET
        else:
            user = UserInfoPreview.from_dict(_user)

        weight = d.pop("weight", UNSET)

        signup_info = cls(
            user=user,
            weight=weight,
        )

        signup_info.additional_properties = d
        return signup_info

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
