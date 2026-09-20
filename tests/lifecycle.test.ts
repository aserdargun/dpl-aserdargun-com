import { afterEach, describe, expect, it } from "vitest";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const root = process.cwd();
const children: ChildProcess[] = [];
const dirs: string[] = [];
async function listener(
  cwd: string,
): Promise<{ child: ChildProcess; port: number }> {
  const child = spawn(
    process.execPath,
    [
      "-e",
      "const s=require('net').createServer();s.listen(0,'127.0.0.1',()=>console.log(s.address().port));",
    ],
    { cwd, stdio: ["ignore", "pipe", "pipe"] },
  );
  children.push(child);
  const port = await new Promise<number>((resolve, reject) => {
    child.stdout!.once("data", (d) => resolve(Number(String(d).trim())));
    child.once("error", reject);
  });
  return { child, port };
}
afterEach(() => {
  for (const c of children.splice(0)) if (c.exitCode === null) c.kill();
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});
describe("safe local lifecycle", () => {
  it("stops only a listener whose cwd is this checkout", async () => {
    const { child, port } = await listener(root);
    const r = spawnSync(process.execPath, ["scripts/stop.mjs"], {
      cwd: root,
      env: { ...process.env, DPL_PORT: String(port) },
      encoding: "utf8",
    });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("Stopped");
    await new Promise<void>((resolve) =>
      child.exitCode !== null ? resolve() : child.once("exit", () => resolve()),
    );
  });
  it("refuses a foreign checkout listener and leaves it alive", async () => {
    const dir = mkdtempSync(join(tmpdir(), "dpl-foreign-"));
    dirs.push(dir);
    const { child, port } = await listener(dir);
    const r = spawnSync(process.execPath, ["scripts/stop.mjs"], {
      cwd: root,
      env: { ...process.env, DPL_PORT: String(port) },
      encoding: "utf8",
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Refusing");
    expect(() => process.kill(child.pid!, 0)).not.toThrow();
  });
  it("is idempotent when no listener exists", () => {
    const r = spawnSync(process.execPath, ["scripts/stop.mjs"], {
      cwd: root,
      env: { ...process.env, DPL_PORT: "18039" },
      encoding: "utf8",
    });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("No listener");
  });
  it("declares usable start, build, validation, and stop scripts", () => {
    const p = JSON.parse(readFileSync("package.json", "utf8"));
    expect(p.scripts.dev).toContain("--host 127.0.0.1");
    expect(p.scripts.dev).toContain("--strictPort");
    expect(p.scripts.validate).toContain("test:e2e");
    expect(p.scripts.stop).toBe("node scripts/stop.mjs");
  });
});
