import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  ...(process.env["CI"] ? { workers: 1 } : {}),
  reporter: process.env["CI"] ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["iPhone 14 Pro Max"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14 Pro Max"] },
    },
  ],
  webServer: {
    command: "doppler run -- bun run start -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env["CI"],
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120 * 1000,
  },
});
