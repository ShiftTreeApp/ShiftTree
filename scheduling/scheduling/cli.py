import argparse
import tomllib
from pathlib import Path

from . import schedule


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("config", type=Path)
    parser.add_argument(
        "--output-format",
        "-f",
        type=str,
        choices=["html", "json"],
        default="json",
    )
    parser.add_argument("--output-file", "-o", type=Path)
    args = parser.parse_args()
    config = schedule.Config(**tomllib.loads(args.config.read_text()))
    result = schedule.solve(
        config=config,
        rules=schedule.default_rules,
    )
    match args.output_format:
        case "html":
            from .html import render_schedule

            output = render_schedule(request=config, response=result)
        case "json":
            output = result.model_dump_json(indent=2)
        case _:
            raise ValueError(f"Unknown output format: {args.output_format}")
    if args.output_file:
        args.output_file.write_text(output)
    else:
        print(output)


if __name__ == "__main__":
    raise SystemExit(main())
