// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './APITEST',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    // Set baseURL for QA environment; can be overridden via BASE_URL env var
    baseURL: process.env.BASE_URL || 'https://qa.restful-booker.example',
    trace: 'on-first-retry',
    // add an environment tag accessible in tests
    environment: 'QA',
  },
  projects: [
    {
      name: 'chromium-qa',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
