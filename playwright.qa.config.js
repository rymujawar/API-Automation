// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { loadYamlEnv } from './helpers/loadYamlEnv.js';

// Load QA YAML (overrides only missing env vars)
loadYamlEnv('./config/qa.yml');

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
