import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 45000,
  reporter: [['html', { open: 'on-failure' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 20000,
  },
  projects: [
    // ── Admin tests ──────────────────────────────────────────────────────
    {
      name: 'chromium',
      testMatch: ['**/admin/**/*.spec.ts', '**/example.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    // ── User tests (fresh context per test, login in beforeEach) ─────────
    {
      name: 'user',
      testMatch: '**/user/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
