from http import HTTPStatus
from typing import Any, Dict, Optional, Union, cast
from uuid import UUID

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.error import Error
from ...types import UNSET, Response, Unset


def _get_kwargs(
    shift_id: UUID,
    *,
    user_id: Union[Unset, UUID] = UNSET,
) -> Dict[str, Any]:
    params: Dict[str, Any] = {}

    json_user_id: Union[Unset, str] = UNSET
    if not isinstance(user_id, Unset):
        json_user_id = str(user_id)
    params["userId"] = json_user_id

    params = {k: v for k, v in params.items() if v is not UNSET and v is not None}

    _kwargs: Dict[str, Any] = {
        "method": "delete",
        "url": f"/signups/{shift_id}",
        "params": params,
    }

    return _kwargs


def _parse_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Optional[Union[Any, Error]]:
    if response.status_code == 204:
        response_204 = cast(Any, None)
        return response_204
    if response.status_code == 404:
        response_404 = Error.from_dict(response.json())

        return response_404
    if response.status_code == 403:
        response_403 = Error.from_dict(response.json())

        return response_403
    if response.status_code == 400:
        response_400 = Error.from_dict(response.json())

        return response_400
    if client.raise_on_unexpected_status:
        raise errors.UnexpectedStatus(response.status_code, response.content)
    else:
        return None


def _build_response(
    *, client: Union[AuthenticatedClient, Client], response: httpx.Response
) -> Response[Union[Any, Error]]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(client=client, response=response),
    )


def sync_detailed(
    shift_id: UUID,
    *,
    client: AuthenticatedClient,
    user_id: Union[Unset, UUID] = UNSET,
) -> Response[Union[Any, Error]]:
    """Remove sign up for shift

     If `userId` is provided and the current user is a manager of the schedule, the specified user
    will have their sign up cancelled.

    Args:
        shift_id (UUID):
        user_id (Union[Unset, UUID]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, Error]]
    """

    kwargs = _get_kwargs(
        shift_id=shift_id,
        user_id=user_id,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    shift_id: UUID,
    *,
    client: AuthenticatedClient,
    user_id: Union[Unset, UUID] = UNSET,
) -> Optional[Union[Any, Error]]:
    """Remove sign up for shift

     If `userId` is provided and the current user is a manager of the schedule, the specified user
    will have their sign up cancelled.

    Args:
        shift_id (UUID):
        user_id (Union[Unset, UUID]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, Error]
    """

    return sync_detailed(
        shift_id=shift_id,
        client=client,
        user_id=user_id,
    ).parsed


async def asyncio_detailed(
    shift_id: UUID,
    *,
    client: AuthenticatedClient,
    user_id: Union[Unset, UUID] = UNSET,
) -> Response[Union[Any, Error]]:
    """Remove sign up for shift

     If `userId` is provided and the current user is a manager of the schedule, the specified user
    will have their sign up cancelled.

    Args:
        shift_id (UUID):
        user_id (Union[Unset, UUID]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, Error]]
    """

    kwargs = _get_kwargs(
        shift_id=shift_id,
        user_id=user_id,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    shift_id: UUID,
    *,
    client: AuthenticatedClient,
    user_id: Union[Unset, UUID] = UNSET,
) -> Optional[Union[Any, Error]]:
    """Remove sign up for shift

     If `userId` is provided and the current user is a manager of the schedule, the specified user
    will have their sign up cancelled.

    Args:
        shift_id (UUID):
        user_id (Union[Unset, UUID]):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, Error]
    """

    return (
        await asyncio_detailed(
            shift_id=shift_id,
            client=client,
            user_id=user_id,
        )
    ).parsed
