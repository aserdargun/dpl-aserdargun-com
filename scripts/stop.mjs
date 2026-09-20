import { execFileSync, spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = realpathSync(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.DPL_PORT ?? 8031);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error("Invalid DPL_PORT");
  process.exit(1);
}
function listeners() {
  const r = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], {
    encoding: "utf8",
  });
  if (r.error || (r.status !== 0 && r.status !== 1))
    throw new Error("Cannot inspect listener ownership; refusing to stop.");
  return [...new Set(r.stdout.trim().split("\n").filter(Boolean).map(Number))];
}
function cwd(pid) {
  const out = execFileSync(
    "lsof",
    ["-a", "-p", String(pid), "-d", "cwd", "-Fn"],
    { encoding: "utf8" },
  );
  const path = out
    .split("\n")
    .find((l) => l.startsWith("n"))
    ?.slice(1);
  if (!path) throw new Error("Cannot verify cwd");
  return realpathSync(path);
}
try {
  const pids = listeners();
  if (!pids.length) {
    console.log(`No listener on ${port}; nothing to stop.`);
    process.exit(0);
  }
  // Validate every listener before touching any process; never kill a foreign checkout.
  for (const pid of pids)
    if (cwd(pid) !== root)
      throw new Error(
        `Refusing to stop listener ${pid}: cwd is not this checkout.`,
      );
  for (const pid of pids) {
    if (cwd(pid) !== root) throw new Error("Ownership changed; refusing.");
    process.kill(pid, "SIGTERM");
  }
  for (let attempt = 0; attempt < 30; attempt++) {
    if (!listeners().some((pid) => pids.includes(pid))) {
      console.log(`Stopped this checkout's listener on ${port}.`);
      process.exit(0);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    "Listener did not exit after SIGTERM; no forced termination attempted.",
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
