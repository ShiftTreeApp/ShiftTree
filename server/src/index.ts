import process from "node:process";

import "dotenv/config";
import express from "express";

import { router } from "@/router";

const app = express();

app.use(express.json());
app.get("/*", router);

const port = process.env.SHIFTTREE_PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
