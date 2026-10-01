import { defineConfig, devices } from '@playwright/test';

// E2E tests run against the production build (`npm run build` first), so they
// exercise exactly what gets deployed to GitHub Pages.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321/find-country-for-phd/',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
  },
});
