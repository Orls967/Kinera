import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.KINERA_E2E_URL || 'http://localhost:4173/Kinera/',
    channel: process.env.CI ? undefined : 'chrome',
    headless: true,
    launchOptions: {
      args: ['--enable-webgl', '--ignore-gpu-blocklist'],
    },
    viewport: { width: 1440, height: 900 },
  },
  webServer: process.env.KINERA_E2E_URL
    ? undefined
    : {
        command: 'npm run preview',
        url: 'http://localhost:4173/Kinera/',
        reuseExistingServer: true,
        timeout: 30_000,
      },
});
