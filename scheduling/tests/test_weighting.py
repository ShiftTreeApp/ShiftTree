import tomllib

from scheduling import schedule


def _chi_squared(observed: int, expected: int) -> float:
    return (observed - expected) ** 2 / expected


def test_users_requesting_shift_with_same_weight_get_shift_fairly():
    config = schedule.Config(
        **tomllib.loads("""
        [shifts.1]
        start_time = "2024-01-01 08:00"
        end_time = "2024-01-01 10:00"

        [shifts.2]
        start_time = "2024-01-02 08:00"
        end_time = "2024-01-02 10:00"

        [employees.a.requests.1]
        weight = 1
        [employees.a.requests.2]
        weight = 1

        [employees.b.requests.1]
        weight = 1
        [employees.b.requests.2]
        weight = 1
        """),
    )

    a_asgns: list[str] = []

    iterations = 100

    for seed in range(iterations):
        config.seed = seed
        res = schedule.solve(config, rules=schedule.default_rules)

        assert len(res.assignments) == 2
        for a in res.assignments:
            if a.user_id == "a":
                a_asgns.append(a.shift_id)

    # NOTE: 3.841 is the 0.05 critical value for a chi-squared test with 1 degree of freedom
    assert (
        _chi_squared(
            observed=sum(1 for a in a_asgns if a == "1"),
            expected=iterations // 2,
        )
        < 3.841
    )


def test_user_requesting_shift_with_heigher_weight_gets_shift():
    config = schedule.Config(
        **tomllib.loads("""
        [shifts.1]
        start_time = "2024-01-01 08:00"
        end_time = "2024-01-01 10:00"

        [shifts.2]
        start_time = "2024-01-02 08:00"
        end_time = "2024-01-02 10:00"

        [employees.a.requests.1]
        weight = 2
        [employees.a.requests.2]
        weight = 1

        [employees.b.requests.1]
        weight = 1
        [employees.b.requests.2]
        weight = 1
        """),
    )

    for seed in range(10):
        config.seed = seed
        res = schedule.solve(config, rules=schedule.default_rules)

        assert len(res.assignments) == 2

        asgn = {a.user_id: a for a in res.assignments}
        assert asgn["a"].shift_id == "1"
        assert asgn["b"].shift_id == "2"


def test_request_weights_are_normalized():
    config = schedule.Config(
        **tomllib.loads("""
        [shifts.1]
        start_time = "2024-01-01 08:00"
        end_time = "2024-01-01 10:00"

        [shifts.2]
        start_time = "2024-01-02 08:00"
        end_time = "2024-01-02 10:00"

        [employees.a.requests.1]
        weight = 500

        [employees.b.requests.1]
        weight = 1
        """),
    )

    a_asgns: list[str] = []

    iterations = 100

    for seed in range(iterations):
        config.seed = seed
        res = schedule.solve(config, rules=schedule.default_rules)

        assert len(res.assignments) == 2
        for a in res.assignments:
            if a.user_id == "a":
                a_asgns.append(a.shift_id)

    # NOTE: 3.841 is the 0.05 critical value for a chi-squared test with 1 degree of freedom
    assert (
        _chi_squared(
            observed=sum(1 for a in a_asgns if a == "1"),
            expected=iterations // 2,
        )
        < 3.841
    )
