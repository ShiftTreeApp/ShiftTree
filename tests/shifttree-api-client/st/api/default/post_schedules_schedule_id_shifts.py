from http import HTTPStatus
from typing import Any, Dict, Optional, Union
from uuid import UUID

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.error import Error
from ...models.shift_create_info import ShiftCreateInfo
from ...models.shift_info import ShiftInfo
from ...types import Response


def _get_kwargs(
    schedule_id: UUID,
    *,
    body: ShiftCreateInfo,
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": f"/schedules/{schedule_id}/shifts",
    }

    _body = body.to_dict()

    _kwargs["json"] = _body
    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[Error, ShiftInfo]]:
    if response.status_code == 201:
        response_201 = ShiftInfo.from_dict(response.json())

        return response_201
    if response.status_code == 404:
        response_404 = Error.from_dict(response.json())

        return response_404
    if response.status_code == 403:
        response_403 = Error.from_dict(response.json())

        return response_403
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[Error, ShiftInfo]]:
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
    body: ShiftCreateInfo,
) -> Response[Union[Error, ShiftInfo]]:
    """Add shift to schedule

    Args:
        schedule_id (UUID):
        body (ShiftCreateInfo):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Error, ShiftInfo]]
    """

    kwargs = _get_kwargs(
        schedule_id=schedule_id,
        body=body,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    schedule_id: UUID,
    *,
    client: AuthenticatedClient,
    body: ShiftCreateInfo,
) -> Optional[Union[Error, ShiftInfo]]:
    """Add shift to schedule

    Args:
        schedule_id (UUID):
        body (ShiftCreateInfo):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Error, ShiftInfo]
    """

    return sync_detailed(
        schedule_id=schedule_id,
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    schedule_id: UUID,
    *,
    client: AuthenticatedClient,
    body: ShiftCreateInfo,
) -> Response[Union[Error, ShiftInfo]]:
    """Add shift to schedule

    Args:
        schedule_id (UUID):
        body (ShiftCreateInfo):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Error, ShiftInfo]]
    """

    kwargs = _get_kwargs(
        schedule_id=schedule_id,
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    schedule_id: UUID,
    *,
    client: AuthenticatedClient,
    body: ShiftCreateInfo,
) -> Optional[Union[Error, ShiftInfo]]:
    """Add shift to schedule

    Args:
        schedule_id (UUID):
        body (ShiftCreateInfo):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Error, ShiftInfo]
    """

    return (
        await asyncio_detailed(
            schedule_id=schedule_id,
            client=client,
            body=body,
        )
    ).parsed
