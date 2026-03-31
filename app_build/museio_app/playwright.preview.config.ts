import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 180_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL:
      process.env.PLAYWRIGHT_TEST_BASE_URL ??
      process.env.PREVIEW_APP_URL ??
      process.env.E2E_APP_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "preview-chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
