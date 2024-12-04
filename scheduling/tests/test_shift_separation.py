import tomllib

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
        shift_gap=24 * 60 * 60,
    )

    res1 = schedule.solve(
        config.model_copy(update=dict(shift_gap=8 * 60 * 60)),
        rules=schedule.default_rules,
    )
    assert res1.status == "optimal"

    res2 = schedule.solve(
        config.model_copy(update=dict(shift_gap=24 * 60 * 60)),
        rules=schedule.default_rules,
    )
    assert res2.status == "infeasible"
