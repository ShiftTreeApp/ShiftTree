import asyncio
from collections.abc import Sequence
from uuid import UUID
import utils
import pytest

from st.models import post_schedules_body
from st.api.default import (
    post_schedules,
    get_shift_tree_code_generate,
    get_shift_tree_code_existing,
    put_join_shift_tree,
    get_schedules_schedule_id_members,
    delete_remove_user_schedule_id,
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
    client3, user_3_email = await utils.create_account_and_login()

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
        client=client2,
        join_code=invite_code.code,
    )
    await put_join_shift_tree.asyncio_detailed(
        client=client3,
        join_code=invite_code.code,
    )

    members = await get_schedules_schedule_id_members.asyncio(
        client=client1,
        schedule_id=schedule_id,
    )
    assert isinstance(members, Sequence)
    assert {m.email for m in members} == {user_2_email, user_3_email}

    user_to_remove = next(m for m in members if m.email == user_3_email)

    kick_result = await delete_remove_user_schedule_id.asyncio_detailed(
        client=client2,
        schedule_id=schedule_id,
        user_id=user_to_remove.id,
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


@pytest.mark.asyncio
async def test_unable_to_join_with_old_code():
    owner, _ = await utils.create_account_and_login()
    user, _ = await utils.create_account_and_login()

    schedule = await post_schedules.asyncio(
        client=owner,
        body=post_schedules_body.PostSchedulesBody(name="New Schedule"),
    )
    assert schedule is not None

    old_invite_code = await get_shift_tree_code_existing.asyncio(
        client=owner,
        shift_tree_id=str(schedule.schedule_id),
    )
    assert old_invite_code is not None

    await get_shift_tree_code_generate.asyncio(
        client=owner,
        shift_tree_id=str(schedule.schedule_id),
    )

    join_res = await put_join_shift_tree.asyncio_detailed(
        client=user,
        join_code=old_invite_code.code,
    )

    assert join_res.status_code.value == 404


@pytest.mark.asyncio
async def test_kick_members():
    owner, _ = await utils.create_account_and_login()
    user1, user1_email = await utils.create_account_and_login()
    user2, user2_email = await utils.create_account_and_login()

    schedule = await post_schedules.asyncio(
        client=owner,
        body=post_schedules_body.PostSchedulesBody(name="New Schedule"),
    )
    assert schedule is not None

    invite_code = await get_shift_tree_code_existing.asyncio(
        client=owner,
        shift_tree_id=str(schedule.schedule_id),
    )
    assert invite_code is not None

    await put_join_shift_tree.asyncio_detailed(
        client=user1,
        join_code=invite_code.code,
    )
    await put_join_shift_tree.asyncio_detailed(
        client=user2,
        join_code=invite_code.code,
    )

    members = await get_schedules_schedule_id_members.asyncio(
        client=owner,
        schedule_id=schedule.schedule_id,
    )
    assert isinstance(members, Sequence)
    assert {m.email for m in members} == {user1_email, user2_email}

    async def remove(user_id: UUID):
        await delete_remove_user_schedule_id.asyncio_detailed(
            client=owner,
            schedule_id=schedule.schedule_id,
            user_id=user_id,
        )

    await asyncio.gather(*(remove(m.id) for m in members))

    members = await get_schedules_schedule_id_members.asyncio(
        client=owner,
        schedule_id=schedule.schedule_id,
    )
    assert isinstance(members, Sequence)
    assert {m.email for m in members} == set()
