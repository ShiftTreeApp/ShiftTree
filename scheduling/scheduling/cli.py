import argparse
import tomllib
from pathlib import Path

from . import schedule


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("config", type=Path)
    args = parser.parse_args()
    config = schedule.Config(**tomllib.loads(args.config.read_text()))
    result = schedule.solve(
        config=config,
        rules=schedule.default_rules,
    )
    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    raise SystemExit(main())
