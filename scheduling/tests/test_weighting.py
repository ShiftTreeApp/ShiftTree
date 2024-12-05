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


def test_large_variaion_beats_small_variation():
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

        [shifts.4]
        start_time = "2024-01-04 08:00"
        end_time = "2024-01-04 10:00"

        [shifts.5]
        start_time = "2024-01-05 08:00"
        end_time = "2024-01-05 10:00"

        [employees.a.requests.1]
        weight = 5
        [employees.a.requests.2]
        weight = 0.1
        [employees.a.requests.3]
        weight = 0.1
        [employees.a.requests.4]
        weight = 0.1
        [employees.a.requests.5]
        weight = 0.1

        [employees.b.requests.1]
        weight = 0.7
        [employees.b.requests.2]
        weight = 0.1
        [employees.b.requests.3]
        weight = 0.2
        [employees.b.requests.4]
        weight = 0.3
        [employees.b.requests.5]
        weight = 0.4
        """),
    )

    for seed in range(100):
        config.seed = seed
        res = schedule.solve(config, rules=schedule.default_rules)

        a_asgn = {a.shift_id for a in res.assignments if a.user_id == "a"}
        assert "1" in a_asgn
