from collections.abc import Sequence
import utils
import pytest

from st.models import post_schedules_body
from st.api.default import (
    post_schedules,
    get_shift_tree_code_generate,
    get_shift_tree_code_existing,
    put_join_shift_tree,
    get_schedules_schedule_id_members,
)


@pytest.mark.asyncio
async def test_create_schedule_and_invite_members():
    client1, _ = await utils.create_account_and_login()
    client2, user_2_email = await utils.create_account_and_login()

    schedule = await post_schedules.asyncio(
        client=client1,
        body=post_schedules_body.PostSchedulesBody(name="New Schedule"),
    )

    assert schedule is not None
    schedule_id = schedule.schedule_id

    await get_shift_tree_code_generate.asyncio(
        client=client1,
        shift_tree_id=str(schedule_id),
    )

    invite_code = await get_shift_tree_code_existing.asyncio(
        client=client1,
        shift_tree_id=str(schedule_id),
    )
    assert invite_code is not None

    await put_join_shift_tree.asyncio_detailed(
        client=client2, join_code=invite_code.code
    )

    members = await get_schedules_schedule_id_members.asyncio(
        client=client1,
        schedule_id=schedule_id,
    )
    assert isinstance(members, Sequence)

    assert len(members) == 1
    assert members[0].email == user_2_email


@pytest.mark.asyncio
async def test_only_owner_allowed_to_invite_members():
    client1, _ = await utils.create_account_and_login()
    client2, _ = await utils.create_account_and_login()

    schedule = await post_schedules.asyncio(
        client=client1,
        body=post_schedules_body.PostSchedulesBody(name="New Schedule"),
    )
    assert schedule is not None
    schedule_id = schedule.schedule_id

    get_code_result = await get_shift_tree_code_existing.asyncio_detailed(
        client=client2,
        shift_tree_id=str(schedule_id),
    )
    assert get_code_result.parsed is None


@pytest.mark.asyncio
async def test_only_owner_allowed_to_generate_code():
    client1, _ = await utils.create_account_and_login()
    client2, _ = await utils.create_account_and_login()

    schedule = await post_schedules.asyncio(
        client=client1,
        body=post_schedules_body.PostSchedulesBody(name="New Schedule"),
    )
    assert schedule is not None
    schedule_id = schedule.schedule_id

    get_code_result = await get_shift_tree_code_generate.asyncio_detailed(
        client=client2,
        shift_tree_id=str(schedule_id),
    )
    assert get_code_result.parsed is None


@pytest.mark.asyncio
async def test_only_owner_allowed_to_kick_members():
    client1, _ = await utils.create_account_and_login()
    client2, user_2_email = await utils.create_account_and_login()

    schedule = await post_schedules.asyncio(
        client=client1,
        body=post_schedules_body.PostSchedulesBody(name="New Schedule"),
    )
    assert schedule is not None
    schedule_id = schedule.schedule_id

    invite_code = await get_shift_tree_code_existing.asyncio(
        client=client1,
        shift_tree_id=str(schedule_id),
    )
    assert invite_code is not None

    await put_join_shift_tree.asyncio_detailed(
        client=client2, join_code=invite_code.code
    )

    members = await get_schedules_schedule_id_members.asyncio(
        client=client1,
        schedule_id=schedule_id,
    )
    assert isinstance(members, Sequence)

    assert len(members) == 1
    assert members[0].email == user_2_email

    kick_result = await put_join_shift_tree.asyncio_detailed(
        client=client2,
        join_code=invite_code.code,
    )
    assert kick_result.status_code.value == 403


@pytest.mark.asyncio
async def test_only_owner_allowed_to_see_members():
    client1, _ = await utils.create_account_and_login()
    client2, _ = await utils.create_account_and_login()

    schedule = await post_schedules.asyncio(
        client=client1,
        body=post_schedules_body.PostSchedulesBody(name="New Schedule"),
    )
    assert schedule is not None
    schedule_id = schedule.schedule_id

    invite_code = await get_shift_tree_code_existing.asyncio(
        client=client1,
        shift_tree_id=str(schedule_id),
    )
    assert invite_code is not None

    await put_join_shift_tree.asyncio_detailed(
        client=client2, join_code=invite_code.code
    )

    # User 2 tries to see the members
    members = await get_schedules_schedule_id_members.asyncio_detailed(
        client=client2,
        schedule_id=schedule_id,
    )
    assert members.status_code.value == 403

    # User 1 sees the members
    members = await get_schedules_schedule_id_members.asyncio(
        client=client1,
        schedule_id=schedule_id,
    )
    assert isinstance(members, Sequence)
