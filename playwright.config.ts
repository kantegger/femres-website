import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Astro's dev server has several content-heavy, hydrated pages. Keeping local
  // concurrency bounded prevents hydration timeouts that do not reproduce in CI.
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: 'output/playwright/report', open: 'never' }]]
    : 'line',
  outputDir: 'output/playwright/test-results',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1',
        url: 'http://127.0.0.1:4321/en/',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
