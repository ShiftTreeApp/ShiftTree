from http import HTTPStatus
from typing import Any, Dict, Optional, Union, cast
from uuid import UUID

import httpx

from ... import errors
from ...client import AuthenticatedClient, Client
from ...models.error import Error
from ...models.post_signups_shift_id_body import PostSignupsShiftIdBody
from ...types import Response


def _get_kwargs(
    shift_id: UUID,
    *,
    body: PostSignupsShiftIdBody,
) -> Dict[str, Any]:
    headers: Dict[str, Any] = {}

    _kwargs: Dict[str, Any] = {
        "method": "post",
        "url": f"/signups/{shift_id}",
    }

    _body = body.to_dict()

    _kwargs["json"] = _body
    headers["Content-Type"] = "application/json"

    _kwargs["headers"] = headers
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
    body: PostSignupsShiftIdBody,
) -> Response[Union[Any, Error]]:
    """Sign up user for shift

     If `userId` is provided and the current user is a manager of the schedule, the specified user
    will be signed up for the shift.

    Args:
        shift_id (UUID):
        body (PostSignupsShiftIdBody):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, Error]]
    """

    kwargs = _get_kwargs(
        shift_id=shift_id,
        body=body,
    )

    response = client.get_httpx_client().request(
        **kwargs,
    )

    return _build_response(client=client, response=response)


def sync(
    shift_id: UUID,
    *,
    client: AuthenticatedClient,
    body: PostSignupsShiftIdBody,
) -> Optional[Union[Any, Error]]:
    """Sign up user for shift

     If `userId` is provided and the current user is a manager of the schedule, the specified user
    will be signed up for the shift.

    Args:
        shift_id (UUID):
        body (PostSignupsShiftIdBody):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Union[Any, Error]
    """

    return sync_detailed(
        shift_id=shift_id,
        client=client,
        body=body,
    ).parsed


async def asyncio_detailed(
    shift_id: UUID,
    *,
    client: AuthenticatedClient,
    body: PostSignupsShiftIdBody,
) -> Response[Union[Any, Error]]:
    """Sign up user for shift

     If `userId` is provided and the current user is a manager of the schedule, the specified user
    will be signed up for the shift.

    Args:
        shift_id (UUID):
        body (PostSignupsShiftIdBody):

    Raises:
        errors.UnexpectedStatus: If the server returns an undocumented status code and Client.raise_on_unexpected_status is True.
        httpx.TimeoutException: If the request takes longer than Client.timeout.

    Returns:
        Response[Union[Any, Error]]
    """

    kwargs = _get_kwargs(
        shift_id=shift_id,
        body=body,
    )

    response = await client.get_async_httpx_client().request(**kwargs)

    return _build_response(client=client, response=response)


async def asyncio(
    shift_id: UUID,
    *,
    client: AuthenticatedClient,
    body: PostSignupsShiftIdBody,
) -> Optional[Union[Any, Error]]:
    """Sign up user for shift

     If `userId` is provided and the current user is a manager of the schedule, the specified user
    will be signed up for the shift.

    Args:
        shift_id (UUID):
        body (PostSignupsShiftIdBody):

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
            body=body,
        )
    ).parsed
