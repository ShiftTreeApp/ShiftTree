import tomllib
from datetime import timedelta

from scheduling import schedule


def test_shift_separation_fail():
    config = schedule.Config(
        **tomllib.loads("""
        [shifts.1]
        start_time = "2024-01-01 08:00"
        end_time = "2024-01-01 10:00"

        [shifts.2]
        start_time = "2024-01-02 08:00"
        end_time = "2024-01-02 10:00"

        [employees.a.requests.1]
        """),
    )

    for seed in range(100):
        res1 = schedule.solve(
            config.model_copy(update=dict(shift_gap=timedelta(hours=8), seed=seed)),
            rules=schedule.default_rules,
        )
        assert res1.status == "optimal"

        res2 = schedule.solve(
            config.model_copy(update=dict(shift_gap=timedelta(hours=24), seed=seed)),
            rules=schedule.default_rules,
        )
        assert res2.status == "infeasible"


def test_shift_separation_interleaved():
    config = schedule.Config(
        **tomllib.loads("""
        [shifts.1]
        start_time = "2024-01-01 09:00"
        end_time = "2024-01-01 17:00"

        [shifts.2]
        start_time = "2024-01-02 09:00"
        end_time = "2024-01-02 17:00"

        [shifts.3]
        start_time = "2024-01-03 09:00"
        end_time = "2024-01-03 17:00"

        [shifts.4]
        start_time = "2024-01-04 09:00"
        end_time = "2024-01-04 17:00"

        [shifts.5]
        start_time = "2024-01-05 09:00"
        end_time = "2024-01-05 17:00"

        [employees.a]
        [employees.b]
        """),
        shift_gap=timedelta(hours=24),
    )

    for seed in range(100):
        res = schedule.solve(
            config.model_copy(update=dict(seed=seed)),
            rules=schedule.default_rules,
        )

        a_asgn = {a.shift_id for a in res.assignments if a.user_id == "a"}

        b_asgn = {a.shift_id for a in res.assignments if a.user_id == "b"}

        assert (a_asgn, b_asgn) in [
            ({"1", "3", "5"}, {"2", "4"}),
            ({"2", "4"}, {"1", "3", "5"}),
        ]


def test_exact_boundaries():
    config = schedule.Config(
        **tomllib.loads("""
        [shifts.1]
        start_time = "2024-01-01 08:00"
        end_time = "2024-01-01 10:00"

        [shifts.2]
        start_time = "2024-01-02 08:00"
        end_time = "2024-01-02 10:00"

        [shifts.3]
        start_time = "2024-01-03 08:00"
        end_time = "2024-01-03 10:00"

        [employees.a]
        """),
        shift_gap=timedelta(hours=22),
    )

    for seed in range(100):
        res = schedule.solve(
            config.model_copy(update=dict(seed=seed)),
            rules=schedule.default_rules,
        )
        assert res.status == "optimal"

        res_changed = schedule.solve(
            config.model_copy(
                update=dict(seed=seed, shift_gap=timedelta(hours=22, seconds=1))
            ),
            rules=schedule.default_rules,
        )
        assert res_changed.status == "infeasible"
