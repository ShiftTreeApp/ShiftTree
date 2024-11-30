import tomllib
from pathlib import Path
from typing import Literal

import pytest

from scheduling import schedule


def collect_pass_fail_tests(dir: Path):
    def collect():
        for path in dir.rglob("*.toml"):
            mode = path.suffixes[-2][1:]
            yield path, mode

    test_files = list(collect())
    return test_files, [path.stem.replace(".", "__") for path, _ in test_files]


values, ids = collect_pass_fail_tests(Path(__file__).parent / "pass_fail")

print(values)


@pytest.mark.parametrize(argnames=("path", "mode"), argvalues=values, ids=ids)
def test_pass_fail_cases(path: Path, mode: Literal["pass", "fail"]):
    config = schedule.Config(**tomllib.loads(path.read_text()))
    result = schedule.solve(
        config=config,
        rules=schedule.default_rules,
    )
    if mode == "pass":
        assert result.status == "optimal"
    else:
        assert result.status != "optimal"
