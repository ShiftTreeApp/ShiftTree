from http import HTTPStatus
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.error import Error
from ...models.shift_info import ShiftInfo
from ...types import Response


def _get_kwargs(
    schedule_id: UUID,
) -> Dict[str, Any]:
    _kwargs: Dict[str, Any] = {
        "method": "get",
        "url": f"/schedules/{schedule_id}/shifts",
    }

    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[Error, List["ShiftInfo"]]]:
    if response.status_code == 200:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in _response_200:
            response_200_item = ShiftInfo.from_dict(response_200_item_data)

            response_200.append(response_200_item)

        return response_200
    if response.status_code == 404:
        response_404 = Error.from_dict(response.json())

        return response_404
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[Error, List["ShiftInfo"]]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    schedule_id: UUID,
    *,
    client: AuthenticatedClient,
) -> Response[Union[Error, List["ShiftInfo"]]]:
    """Get schedule shifts

    Args:
        schedule_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Error, List['ShiftInfo']]]
    """

    kwargs = _get_kwargs(
        schedule_id=schedule_id,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    schedule_id: UUID,
    *,
    client: AuthenticatedClient,
) -> Optional[Union[Error, List["ShiftInfo"]]]:
    """Get schedule shifts

    Args:
        schedule_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Error, List['ShiftInfo']]
    """

    return sync_detailed(
        schedule_id=schedule_id,
        client=client,
    ).parsed


async def asyncio_detailed(
    schedule_id: UUID,
    *,
    client: AuthenticatedClient,
) -> Response[Union[Error, List["ShiftInfo"]]]:
    """Get schedule shifts

    Args:
        schedule_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Error, List['ShiftInfo']]]
    """

    kwargs = _get_kwargs(
        schedule_id=schedule_id,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    schedule_id: UUID,
    *,
    client: AuthenticatedClient,
) -> Optional[Union[Error, List["ShiftInfo"]]]:
    """Get schedule shifts

    Args:
        schedule_id (UUID):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Error, List['ShiftInfo']]
    """

    return (
        await asyncio_detailed(
            schedule_id=schedule_id,
            client=client,
        )
    ).parsed
