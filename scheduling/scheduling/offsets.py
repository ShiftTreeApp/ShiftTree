import itertools
from math import ceil
from typing import Mapping


def compute_shifts_per_user[K](
    offsets: Mapping[K, int],
    n_shifts: int,
) -> Mapping[K, int]:
    if len(offsets) == 0:
        raise ValueError("offsets must not be empty")

    if n_shifts <= 0:
        return {k: 0 for k in offsets}

    min_offset = min(offsets.values())
    offsets_shifted = {k: v - min_offset for k, v in offsets.items()}
    if sum(offsets_shifted.values()) > n_shifts:
        high = 1
        low = 0
        for _ in range(16):
            fac = (high + low) / 2
            test_offsets = {k: ceil(v * fac) for k, v in offsets_shifted.items()}
            if sum(test_offsets.values()) > n_shifts:
                high = fac
            else:
                low = fac

    discrepancy = n_shifts - sum(offsets_shifted.values())
    if discrepancy > 0:
        for k in itertools.cycle(
            sorted(offsets_shifted, key=lambda k: offsets_shifted[k], reverse=True)
        ):
            if discrepancy == 0:
                break
            offsets_shifted[k] += 1
            discrepancy -= 1
    elif discrepancy < 0:
        for k in itertools.cycle(
            sorted(offsets_shifted, key=lambda k: offsets_shifted[k])
        ):
            if discrepancy == 0:
                break
            if offsets_shifted[k] > 0:
                offsets_shifted[k] -= 1
                discrepancy += 1

    return offsets_shifted
