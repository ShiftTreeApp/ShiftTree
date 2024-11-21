.PHONY: check format docker-build-all docker-build-client docker-build-server docker-build-scheduler

check:
	cd client && pnpm check
	cd server && pnpm check

format:
	cd client && pnpm prettier --check src --write
	cd server && pnpm prettier --check src --write

docker-build-all: docker-build-client docker-build-server docker-build-scheduler

docker-build-client:
	docker build -t ghcr.io/shifttreeapp/client:latest ./client

docker-build-server:
	docker build -t ghcr.io/shifttreeapp/server:latest ./server

docker-build-scheduler:
	docker build -t ghcr.io/shifttreeapp/scheduler:latest ./scheduling
