from hypothesis import given
from hypothesis import strategies as st

from scheduling.offsets import compute_shifts_per_user


@given(
    offsets=st.dictionaries(
        keys=st.uuids().map(str),
        values=st.integers(min_value=-3, max_value=3),
        min_size=1,
        max_size=50,
    ),
    n_shifts=st.integers(min_value=0, max_value=500),
)
def test_sum_equals_total_shifts(offsets: dict[str, int], n_shifts: int):
    result = compute_shifts_per_user(offsets, n_shifts)
    assert sum(result.values()) == n_shifts


@given(
    offsets=st.dictionaries(
        keys=st.uuids().map(str),
        values=st.integers(min_value=-3, max_value=3),
        min_size=5,
        max_size=30,
    ),
    n_shifts=st.integers(min_value=20, max_value=600),
)
def test_values_are_close_to_requested_distribution(
    offsets: dict[str, int],
    n_shifts: int,
):
    result = compute_shifts_per_user(offsets, n_shifts)
    avg_offset = sum(offsets.values()) / len(offsets)
    offsets_normalized = {k: v - avg_offset for k, v in offsets.items()}

    avg_result = sum(result.values()) / len(result)
    results_normalized = {k: v - avg_result for k, v in result.items()}

    diffs = {
        k: abs(v1 - v2)
        for (k, v1), (_, v2) in zip(
            results_normalized.items(), offsets_normalized.items()
        )
    }

    assert all(diffs.values()) < 1.5


@given(
    offsets=st.dictionaries(
        keys=st.uuids().map(str),
        values=st.just(3),
        min_size=5,
        max_size=30,
    ),
    n_shifts=st.integers(min_value=20, max_value=600),
)
def test_requesting_same_value_for_all_users_does_nothing(
    offsets: dict[str, int],
    n_shifts: int,
):
    result = compute_shifts_per_user(offsets, n_shifts)
    avg_shifts = n_shifts // len(offsets)
    assert all(v == avg_shifts or v == (avg_shifts + 1) for v in result.values())
