from datetime import datetime, timedelta
from typing import Callable, Mapping

from hypothesis import given
from hypothesis import strategies as st

from scheduling import schedule

type ShiftMap = Mapping[str, schedule.Shift]
type RequestMap = Mapping[str, schedule.Request]


@st.composite
def shifts(
    draw: st.DrawFn,
    min_shifts: int = 15,
    max_shifts: int = 30,
    schedule_max_length_days: int = 7,
    min_shift_duration_hours: int = 1,
    max_shift_duration_hours: int = 8,
):
    schedule_start = datetime(2024, 1, 1)
    schedule_end = schedule_start + timedelta(
        days=draw(st.integers(min_value=1, max_value=schedule_max_length_days))
    )
    num_timeslots = draw(st.integers(min_value=1, max_value=max_shifts))
    timeslot_starts = draw(
        st.lists(
            st.integers(
                min_value=0,
                max_value=int((schedule_end - schedule_start).total_seconds() // 3600),
            ).map(lambda hours: schedule_start + timedelta(hours=hours)),
            min_size=num_timeslots,
            max_size=num_timeslots,
        ),
    )
    timeslot_durations = draw(
        st.lists(
            st.integers(
                min_value=min_shift_duration_hours,
                max_value=max_shift_duration_hours,
            ).map(lambda t: timedelta(hours=t)),
            min_size=num_timeslots,
            max_size=num_timeslots,
        )
    )
    timeslots = [
        (start, start + duration)
        for start, duration in zip(timeslot_starts, timeslot_durations)
    ]

    shifts = draw(
        st.dictionaries(
            keys=st.uuids().map(str),
            values=st.sampled_from(timeslots).map(
                lambda slot: schedule.Shift(start_time=slot[0], end_time=slot[1])
            ),
            min_size=min_shifts,
            max_size=max_shifts,
        )
    )

    return shifts


@st.composite
def shift_requests(
    draw: st.DrawFn,
    shifts: ShiftMap,
    min_weight: float = 0.0,
    max_weight: float = 1.0,
    min_requests: int = 2,
    max_requests: int = 15,
):
    return draw(
        st.dictionaries(
            keys=st.sampled_from(list(shifts.keys())),
            values=st.floats(min_value=min_weight, max_value=max_weight).map(
                lambda weight: schedule.Request(weight=weight)
            ),
            min_size=min_requests,
            max_size=max_requests,
        )
    )


@st.composite
def configs(
    draw: st.DrawFn,
    shifts_st: st.SearchStrategy[ShiftMap] = shifts(),
    requests_st_fn: Callable[
        [ShiftMap], st.SearchStrategy[RequestMap]
    ] = shift_requests,
    min_users: int = 5,
    max_users: int = 10,
    min_seed: int = 0,
    max_seed: int = 50,
):
    shifts = draw(shifts_st)
    users = draw(
        st.dictionaries(
            keys=st.uuids().map(str),
            values=requests_st_fn(shifts).map(lambda m: schedule.Employee(requests=m)),
            min_size=min_users,
            max_size=max_users,
        )
    )
    return schedule.Config(
        shifts=shifts,
        employees=users,
        seed=draw(st.integers(min_value=min_seed, max_value=max_seed)),
    )


@given(
    config=configs(
        shifts_st=shifts(min_shifts=5, max_shifts=5, schedule_max_length_days=2),
        min_users=5,
        max_users=8,
    )
)
def test_schedule_with_as_many_employees_as_shifts_always_succeeds(
    config: schedule.Config,
):
    res = schedule.solve(config, rules=schedule.default_rules)
    assert res.status == "optimal"


@given(
    config=configs(
        shifts_st=shifts(min_shifts=5, max_shifts=5, schedule_max_length_days=2),
        min_users=5,
        max_users=8,
    )
)
def test_all_shifts_are_assigned(config: schedule.Config):
    res = schedule.solve(config, rules=schedule.default_rules)
    assert res.status == "optimal"
    assigned_shifts = {a.shift_id for a in res.assignments}
    assert assigned_shifts == set(config.shifts.keys())


@given(
    config=configs(
        shifts_st=shifts(
            min_shifts=5,
            max_shifts=8,
            schedule_max_length_days=1,
            min_shift_duration_hours=25,
            max_shift_duration_hours=36,
        ),
        min_users=1,
        max_users=3,
    )
)
def test_schedules_with_insufficient_employees_fail(config: schedule.Config):
    res = schedule.solve(config, rules=schedule.default_rules)
    assert res.status == "infeasible"
