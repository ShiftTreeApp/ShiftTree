import itertools
import random
from math import ceil
from typing import Mapping


def ensure_valid_distribtion[K](
    offsets: Mapping[K, int],
    n_shifts: int,
) -> Mapping[K, int]:
    assert n_shifts >= 0

    avg_offset = sum(offsets.values()) / len(offsets)
    offsets = {k: round(v - avg_offset) for k, v in offsets.items()}
    pos_sum = sum(v for v in offsets.values() if v > 0)
    neg_sum = abs(sum(v for v in offsets.values() if v < 0))

    if pos_sum > n_shifts:
        avg_discrepancy = ceil((pos_sum - n_shifts) / n_shifts)
        for key in (k for k, v in offsets.items() if v > 0):
            offsets[key] -= avg_discrepancy
    if neg_sum > n_shifts:
        avg_discrepancy = ceil((neg_sum - n_shifts) / n_shifts)
        for key in (k for k, v in offsets.items() if v < 0):
            offsets[key] += avg_discrepancy

    pos_sum = sum(v for v in offsets.values() if v > 0)
    neg_sum = abs(sum(v for v in offsets.values() if v < 0))

    sorted_pos = sorted(
        (k for k, v in offsets.items() if v > 0),
        key=lambda k: offsets[k],
        reverse=True,
    )
    sorted_neg = sorted(
        (k for k, v in offsets.items() if v < 0),
        key=lambda k: offsets[k],
    )
    if pos_sum > neg_sum:
        for key in sorted_pos[: pos_sum - neg_sum]:
            offsets[key] -= 1
    elif pos_sum < neg_sum:
        for key in sorted_neg[: neg_sum - pos_sum]:
            offsets[key] += 1

    return offsets


def compute_shifts_per_user[K](
    offsets: Mapping[K, int],
    n_shifts: int,
    random_seed: int | None = None,
) -> Mapping[K, int]:
    if len(offsets) == 0:
        raise ValueError("offsets must not be empty")

    if n_shifts <= 0:
        return {k: 0 for k in offsets}

    avg_shifts_per_user = n_shifts // len(offsets)
    if random_seed is not None:
        keys = list(offsets.keys())
        random.Random(random_seed).shuffle(keys)
        counts = {k: avg_shifts_per_user for k in keys}
    else:
        counts = {k: avg_shifts_per_user for k in offsets.keys()}

    offsets = ensure_valid_distribtion(offsets, n_shifts)

    for k, offset in offsets.items():
        counts[k] = max(0, counts[k] + offset)

    s = sum(counts.values())
    if s > n_shifts:
        for k in itertools.cycle(offsets.keys()):
            if s == n_shifts:
                break
            if counts[k] > 0:
                counts[k] -= 1
                s -= 1
    elif s < n_shifts:
        for k in itertools.cycle(offsets.keys()):
            if s == n_shifts:
                break
            counts[k] += 1
            s += 1

    assert sum(counts.values()) == n_shifts

    return counts
