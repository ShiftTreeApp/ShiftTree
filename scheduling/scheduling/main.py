import os

import dotenv
import fastapi

from scheduling import schedule
from scheduling.models import Config, ScheduleRequest, ScheduleResponse

app = fastapi.FastAPI()


@app.post("/shifts")
def generate_schedule(req: ScheduleRequest) -> ScheduleResponse:
    return schedule.solve(
        config=schedule.Config.from_request(req),
        rules=(
            schedule.exactly_one_shift_per_employee,
            schedule.evenly_distribute_shifts,
            schedule.prevent_overlapping_shifts,
            # FIXME: This causes a runtime error
            # schedule.prevent_consecutive_shifts,
        ),
    )


def main():
    import uvicorn

    config = Config(
        **{
            **dotenv.dotenv_values(".env"),
            **os.environ,
        }
    )

    uvicorn.run(app, host=config.host, port=config.port)


if __name__ == "__main__":
    raise SystemExit(main())
