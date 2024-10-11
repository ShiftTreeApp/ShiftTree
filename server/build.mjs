#!/usr/bin/env node

import * as process from "node:process";

import * as esbuild from "esbuild";

import packageJson from "./package.json" assert { type: "json" };

/** @type{import("esbuild").BuildOptions} */
export const buildOpts = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  outfile: "dist/index.cjs",
  external: [...Object.keys(packageJson.dependencies)],
};

console.log("esbuild opts:");
console.log({
  ...buildOpts,
});

if (process.env.SHIFTTREE_BUILD_PROD) {
  await esbuild.build({
    ...buildOpts,
    minify: true,
    treeShaking: true,
  });
} else {
  await esbuild.build({ ...buildOpts, sourcemap: true });
}
