import pytest
import utils
from datetime import datetime, timezone

from st.models import post_schedules_body, shift_create_info
from st.api.default import (
    post_schedules,
    get_shift_tree_code_generate,
    put_join_shift_tree,
    post_schedules_schedule_id_shifts,
)


@pytest.mark.asyncio
async def test_owner_can_create_shifts():
    owner, _ = await utils.create_account_and_login()

    schedule = await post_schedules.asyncio(
        client=owner,
        body=post_schedules_body.PostSchedulesBody(name="New Schedule"),
    )
    assert schedule is not None

    shift_res = await post_schedules_schedule_id_shifts.asyncio_detailed(
        client=owner,
        schedule_id=schedule.schedule_id,
        body=shift_create_info.ShiftCreateInfo(
            name="New Shift",
            start_time=datetime.now(tz=timezone.utc),
            end_time=datetime.now(tz=timezone.utc),
        ),
    )
    assert shift_res.status_code in range(200, 300)


@pytest.mark.asyncio
async def test_members_cannot_create_shifts():
    owner, _ = await utils.create_account_and_login()
    member, _ = await utils.create_account_and_login()

    schedule = await post_schedules.asyncio(
        client=owner,
        body=post_schedules_body.PostSchedulesBody(name="New Schedule"),
    )
    assert schedule is not None

    join_code = await get_shift_tree_code_generate.asyncio(
        client=owner,
        shift_tree_id=str(schedule.schedule_id),
    )
    assert join_code is not None

    join_res = await put_join_shift_tree.asyncio_detailed(
        client=member, join_code=join_code.code
    )
    assert join_res.status_code == 204

    shift_res = await post_schedules_schedule_id_shifts.asyncio_detailed(
        client=member,
        schedule_id=schedule.schedule_id,
        body=shift_create_info.ShiftCreateInfo(
            name="New Shift",
            start_time=datetime.now(),
            end_time=datetime.now(),
        ),
    )
    assert shift_res.status_code in range(400, 500)
