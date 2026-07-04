import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 13"] } },
  ],
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : {
        command: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? "npm run dev -- --hostname 127.0.0.1 --port 3000",
        port: 3000,
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
      },
});
