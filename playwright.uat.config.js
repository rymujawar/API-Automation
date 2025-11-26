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
    // Set baseURL for UAT environment; can be overridden via BASE_URL env var
    baseURL: process.env.BASE_URL || 'https://uat.restful-booker.example',
    trace: 'on-first-retry',
    environment: 'UAT',
  },
  projects: [
    {
      name: 'chromium-uat',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
