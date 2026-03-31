import { defineConfig, devices } from "@playwright/test";

const localSupabaseUrl = process.env.E2E_SUPABASE_URL ?? "http://127.0.0.1:54321";
const localPublishableKey =
  process.env.E2E_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "local-dev-publishable-key";
const localServiceRoleKey =
  process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ?? "local-dev-service-role-key";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 180_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    video: "retain-on-failure"
  },
  webServer: [
    {
      command:
        "env -u SSL_CERT_FILE API_PORT=4000 NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000 NEXT_PUBLIC_API_URL=http://127.0.0.1:4000/api SUPABASE_URL=" +
        localSupabaseUrl +
        " SUPABASE_PUBLISHABLE_DEFAULT_KEY=" +
        localPublishableKey +
        " SUPABASE_SERVICE_ROLE_KEY=" +
        localServiceRoleKey +
        " STRIPE_SECRET_KEY=sk_test_placeholder STRIPE_WEBHOOK_SECRET=whsec_mock_local npm exec -- pnpm --filter @museio/api start",
      port: 4000,
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command:
        "env -u SSL_CERT_FILE NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000 NEXT_PUBLIC_API_URL=http://127.0.0.1:4000/api NEXT_PUBLIC_SUPABASE_URL=" +
        localSupabaseUrl +
        " NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=" +
        localPublishableKey +
        " npm exec -- pnpm --filter @museio/web dev",
      port: 3000,
      reuseExistingServer: true,
      timeout: 120_000
    }
  ],
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"]
      }
    }
  ]
});
