#!/usr/bin/env node

import * as process from "node:process";
import * as fs from "node:fs/promises";

import * as esbuild from "esbuild";

const packageJson = JSON.parse(
  await fs.readFile("./package.json", { encoding: "utf-8" }),
);

/** @type{import("esbuild").BuildOptions} */
export const buildOpts = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  outfile: "dist/index.cjs",
  external: [...Object.keys(packageJson.dependencies)],
};

if (process.env.SHIFTTREE_BUILD_PROD) {
  await esbuild.build({
    ...buildOpts,
    minify: true,
    treeShaking: true,
  });
} else {
  await esbuild.build({ ...buildOpts, sourcemap: true });
}
