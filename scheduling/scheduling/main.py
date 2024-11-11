import os

import dotenv
import fastapi

from scheduling.models import Config, ScheduleRequest, ScheduleResponse

app = fastapi.FastAPI()


@app.get("/shifts")
def generate_schedule(_req: ScheduleRequest) -> ScheduleResponse:
    return ScheduleResponse(assignments=[])


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
