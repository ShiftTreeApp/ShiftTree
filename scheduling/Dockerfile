FROM ghcr.io/astral-sh/uv:0.5.2-python3.12-bookworm
COPY . /app
WORKDIR /app
RUN uv sync
ENTRYPOINT []
CMD ["uv", "run", "-m", "scheduling.main"]