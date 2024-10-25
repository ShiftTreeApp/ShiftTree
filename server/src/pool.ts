import { Pool } from "pg";

const host = process.env.SHIFTTREE_PG_HOST;
if (!host) {
  throw new Error("Environment variable SHIFTTREE_PG_HOST is not set");
}

const port0 = process.env.SHIFTTREE_PG_PORT;
if (!port0) {
  throw new Error("Environment variable SHIFTTREE_PG_PORT is not set");
}
const port = parseInt(port0);

const database = process.env.SHIFTTREE_PG_DATABASE;
if (!database) {
  throw new Error("Environment variable SHIFTTREE_PG_DATABASE is not set");
}

const user = process.env.SHIFTTREE_PG_USER;
if (!user) {
  throw new Error("Environment variable SHIFTTREE_PG_USER is not set");
}

const password = process.env.SHIFTTREE_PG_PASSWORD;
if (!password) {
  throw new Error("Environment variable SHIFTTREE_PG_PASSWORD is not set");
}

export const pool = new Pool({
  host,
  port,
  database,
  user,
  password,
});
