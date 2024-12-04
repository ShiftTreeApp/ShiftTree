# ShiftTree - Automatic shift scheduling

Hosted version 🌐: [shifttree.org](https://shifttree.org/)

<div align="center">
<img src="icons/shiftTree_favicon.png" alt="ShiftTree logo" width="100"/>
</div>

## Self-hosting instructions

**Requirements:**

- Most versions of linux. Tested on Fedora 41 and Ubuntu 24.04, but it should work on any system with Docker.
- Docker.
- Docker, recent versions with the embedded `docker compose` command and not `docker-compose`.

**Instructions:**

Clone the repository in the hosting environment:

```bash
git clone https://github.com/shifttreeapp/shifttree
cd shifttree
```

Create an `.env` file that holds the JWT secret.

```bash
echo 'SHIFTTREE_JWT_PK="'$(openssl rand -base64 32)'"' > .env
```

Run the app:

```bash
docker compose -f compose.prod.yaml up -d
```

**Updating:**

To update an existing running instance, pull the latest changes and restart the app:

```bash
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
```

## Testing instructions

**Requirements:**

- Linux. Tested on Fedora 41, but should work on most recent distributions.
- Docker for running the server
- `uv` package manager for installing python dependencies. [(Install instructions)](https://docs.astral.sh/uv/getting-started/installation/#__tabbed_1_1)

**Instructions:**

Clone the repository:

```bash
git clone https://github.com/shifttreeapp/shifttree
cd shifttree
```

Run the tests in the `scheduler` directory:

```bash
cd scheduler
uv sync
uv run pytest -v
```

The integration tests for the server needs an extra dependency:

- `pnpm` for installing node packages

```bash
# in the repository root
# Run the dev database:
docker compose up -d

# Install the node dependencies and run the server
pushd server
pnpm install
pnpm dev
popd
```

```bash
cd tests
uv sync
uv run pytest -v
```
