# ShiftTree app

## Dev installation and build

### Client

In `/client`, run:

```bash
pnpm install
# or
pnpm i
```

to install the dependencies into `node_modules`. Then start the dev server by running:

```bash
pnpm dev
```
The log output displays what port the server is listening on.
This supports auto reloading so when you change a file in the client code, it will auto refresh the
dev server and reload the page in your browser.

### Server

In `/server`, install the dependencies in the same was as client, then run `pnpm dev` to start the server.
Unfortunately this doesn't have auto reloading so every time you change something you have to restart the server.
You can do this quickly by pressing `ctrl+c` and then up arrow and enter.
