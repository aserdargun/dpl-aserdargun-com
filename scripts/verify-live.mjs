import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const base = process.env.DPL_BASE_URL;
assert.ok(base, "Set DPL_BASE_URL to the intended HTTPS deployment");
const origin = new URL(base);
assert.equal(origin.protocol, "https:");
const expected =
  process.env.DPL_EXPECTED_SHA ||
  process.env.GITHUB_SHA ||
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
async function get(path) {
  const response = await fetch(new URL(path, origin), {
    signal: AbortSignal.timeout(30000),
    cache: "no-store",
  });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response;
}
const response = await get("/release.json");
assert.match(response.headers.get("content-type") ?? "", /application\/json/);
assert.match(response.headers.get("cache-control") ?? "", /no-store/);
const release = await response.json();
assert.equal(release.commit, expected);
assert.equal(release.application, "DPL");
assert.equal(release.repository, "aserdargun/dpl-aserdargun-com");
assert.ok(release.files["index.html"]);
assert.ok(release.files["favicon.svg"]);
assert.ok(Object.keys(release.files).some((p) => p.endsWith(".js")));
assert.ok(Object.keys(release.files).some((p) => p.endsWith(".css")));
let count = 1;
for (const [path, file] of Object.entries(release.files)) {
  if (path === "staticwebapp.config.json") continue; // Azure consumes the configuration rather than serving it.
  assert.match(
    path,
    /^(?:index\.html|favicon\.svg|assets\/[A-Za-z0-9_-]+\.(?:js|css))$/,
  );
  const res = await get(`/${path}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    file.sha256,
    `${path} digest`,
  );
  assert.equal(bytes.length, file.bytes);
  const type = res.headers.get("content-type") ?? "";
  assert.match(
    type,
    path.endsWith(".html")
      ? /text\/html/
      : path.endsWith(".js")
        ? /(?:application|text)\/javascript/
        : path.endsWith(".css")
          ? /text\/css/
          : /image\/svg\+xml/,
  );
  if (path.startsWith("assets/"))
    assert.match(res.headers.get("cache-control") ?? "", /immutable/);
  count++;
}
const index = await get("/");
assert.match(index.headers.get("content-type") ?? "", /text\/html/);
assert.match(index.headers.get("cache-control") ?? "", /no-cache/);
assert.ok((await index.text()).includes("DPL — Decision Plane Laboratory"));
console.log(
  `Live verified: ${origin.origin}, commit ${expected}, ${count + 1} HTTP/MIME responses, all public asset hashes and cache headers`,
);
