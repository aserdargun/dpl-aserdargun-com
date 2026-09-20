import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 4,
  timeout: 30000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.DPL_BASE_URL || "http://127.0.0.1:18032",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.DPL_BASE_URL
    ? undefined
    : {
        command: "npx vite preview --host 127.0.0.1 --port 18032 --strictPort",
        url: "http://127.0.0.1:18032",
        reuseExistingServer: false,
        timeout: 15000,
      },
});
