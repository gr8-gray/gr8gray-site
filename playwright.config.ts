import { defineConfig, devices } from "@playwright/test";

// Runs against production by default — these specs are read-only smoke checks
// of the live lead funnel. Override for a local/preview build:
//   E2E_BASE_URL=http://localhost:4321 npx playwright test
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  // The live page's `load` event can take 20s+ (large hero art, Turnstile CDN
  // script), so specs navigate on domcontentloaded and get a roomier budget.
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://gr8gray.dev",
    navigationTimeout: 45_000,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
