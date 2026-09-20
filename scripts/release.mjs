import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
const sha =
  process.env.GITHUB_SHA ||
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error("Invalid release commit SHA");
const files = {};
function walk(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = `${directory}/${item.name}`;
    if (item.isDirectory()) walk(path);
    else if (item.name !== "release.json")
      files[path.slice(5)] = {
        sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
        bytes: readFileSync(path).length,
      };
  }
}
walk("dist");
writeFileSync(
  "dist/release.json",
  JSON.stringify(
    {
      schemaVersion: "1.0.0",
      application: "DPL",
      repository: "aserdargun/dpl-aserdargun-com",
      commit: sha,
      builtAt: new Date().toISOString(),
      files,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Stamped DPL ${sha.slice(0, 7)} with ${Object.keys(files).length} static files`,
);
