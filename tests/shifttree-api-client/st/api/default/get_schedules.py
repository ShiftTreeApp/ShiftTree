from http import HTTPStatus
from typing import Any, Dict, List, Optional, Union

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.get_schedules_role_item import GetSchedulesRoleItem
from ...models.schedule_info_preview import ScheduleInfoPreview
from ...types import UNSET, Response, Unset


def _get_kwargs(
    *,
    role: Union[Unset, List[GetSchedulesRoleItem]] = UNSET,
) -> Dict[str, Any]:
    params: Dict[str, Any] = {}

    json_role: Union[Unset, List[str]] = UNSET
    if not isinstance(role, Unset):
        json_role = []
        for role_item_data in role:
            role_item: str = role_item_data
            json_role.append(role_item)

    params["role"] = json_role

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: Dict[str, Any] = {
        "method": "get",
        "url": "/schedules",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[List["ScheduleInfoPreview"]]:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = ScheduleInfoPreview.from_dict(response_200_item_data)

            response_200.append(response_200_item)

        return response_200
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[List["ScheduleInfoPreview"]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    role: Union[Unset, List[GetSchedulesRoleItem]] = UNSET,
) -> Response[List["ScheduleInfoPreview"]]:
    """Get all schedules owned by the current user and the schedules the user is a member of

    Args:
        role (Union[Unset, List[GetSchedulesRoleItem]]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[List['ScheduleInfoPreview']]
    """

    kwargs = _get_kwargs(
        role=role,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    *,
    client: AuthenticatedClient,
    role: Union[Unset, List[GetSchedulesRoleItem]] = UNSET,
) -> Optional[List["ScheduleInfoPreview"]]:
    """Get all schedules owned by the current user and the schedules the user is a member of

    Args:
        role (Union[Unset, List[GetSchedulesRoleItem]]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        List['ScheduleInfoPreview']
    """

    return sync_detailed(
        client=client,
        role=role,
    ).parsed


async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    role: Union[Unset, List[GetSchedulesRoleItem]] = UNSET,
) -> Response[List["ScheduleInfoPreview"]]:
    """Get all schedules owned by the current user and the schedules the user is a member of

    Args:
        role (Union[Unset, List[GetSchedulesRoleItem]]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[List['ScheduleInfoPreview']]
    """

    kwargs = _get_kwargs(
        role=role,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    *,
    client: AuthenticatedClient,
    role: Union[Unset, List[GetSchedulesRoleItem]] = UNSET,
) -> Optional[List["ScheduleInfoPreview"]]:
    """Get all schedules owned by the current user and the schedules the user is a member of

    Args:
        role (Union[Unset, List[GetSchedulesRoleItem]]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        List['ScheduleInfoPreview']
    """

    return (
        await asyncio_detailed(
            client=client,
            role=role,
        )
    ).parsed
