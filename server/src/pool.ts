import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.SHIFTTREE_PG_HOST,
  port: parseInt(process.env.SHIFTTREE_PG_PORT ?? "5432"),
  database: process.env.SHIFTTREE_PG_DATABASE,
  user: process.env.SHIFTTREE_PG_USER,
  password: process.env.SHIFTTREE_PG_PASSWORD,
});
