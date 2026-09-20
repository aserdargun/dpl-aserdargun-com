import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
const release = JSON.parse(readFileSync("dist/release.json", "utf8"));
assert.equal(release.application, "DPL");
assert.match(release.commit, /^[a-f0-9]{40}$/);
if (process.env.GITHUB_SHA)
  assert.equal(release.commit, process.env.GITHUB_SHA);
assert.equal(release.schemaVersion, "1.0.0");
for (const file of ["index.html", "favicon.svg", "staticwebapp.config.json"])
  assert.ok(release.files[file], `Missing ${file}`);
const html = readFileSync("dist/index.html", "utf8");
assert.ok(html.includes("DPL — Decision Plane Laboratory"));
assert.ok(!html.includes("/src/"));
for (const match of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g))
  assert.ok(
    release.files[match[1].slice(1)],
    `Unpackaged reference ${match[1]}`,
  );
function list(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? list(`${dir}/${e.name}`) : [`${dir}/${e.name}`],
  );
}
assert.deepEqual(
  list("dist")
    .map((p) => p.slice(5))
    .filter((p) => p !== "release.json")
    .sort(),
  Object.keys(release.files).sort(),
);
for (const [file, expected] of Object.entries(release.files)) {
  assert.match(
    file,
    /^(?:index\.html|favicon\.svg|staticwebapp\.config\.json|assets\/[A-Za-z0-9_-]+\.(?:js|css))$/,
  );
  const bytes = readFileSync(`dist/${file}`);
  assert.equal(bytes.length, expected.bytes);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    expected.sha256,
  );
}
const config = JSON.parse(
  readFileSync("dist/staticwebapp.config.json", "utf8"),
);
assert.equal(config.globalHeaders["Cache-Control"], "no-cache");
assert.equal(
  config.routes.find((r) => r.route === "/release.json").headers[
    "Cache-Control"
  ],
  "no-store",
);
console.log(
  `Artifact verified: ${Object.keys(release.files).length} files, internal references, hashes, release identity and cache rules`,
);
