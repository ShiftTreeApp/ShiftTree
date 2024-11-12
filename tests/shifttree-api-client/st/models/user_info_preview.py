from typing import Any, Dict, List, Type, TypeVar, Union
from uuid import UUID

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

T = TypeVar("T", bound="UserInfoPreview")


@_attrs_define
class UserInfoPreview:
    """
    Attributes:
        id (UUID):
        display_name (str):
        email (str):
        profile_image_url (Union[Unset, str]):
    """

    id: UUID
    display_name: str
    email: str
    profile_image_url: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        id = str(self.id)

        display_name = self.display_name

        email = self.email

        profile_image_url = self.profile_image_url

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "displayName": display_name,
                "email": email,
            }
        )
        if profile_image_url is not UNSET:
            field_dict["profileImageUrl"] = profile_image_url

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        id = UUID(d.pop("id"))

        display_name = d.pop("displayName")

        email = d.pop("email")

        profile_image_url = d.pop("profileImageUrl", UNSET)

        user_info_preview = cls(
            id=id,
            display_name=display_name,
            email=email,
            profile_image_url=profile_image_url,
        )

        user_info_preview.additional_properties = d
        return user_info_preview

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
