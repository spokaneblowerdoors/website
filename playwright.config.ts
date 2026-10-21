import { defineConfig, devices } from '@playwright/test';

// Tests run against the built site. Set BASE_URL to test a deployed preview instead.
const baseURL = process.env.BASE_URL ?? 'http://localhost:4322';

export default defineConfig({
  testDir: 'tests',
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npx astro preview --port 4322', url: baseURL, reuseExistingServer: !process.env.CI },
});
