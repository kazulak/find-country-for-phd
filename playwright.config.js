import { defineConfig, devices } from '@playwright/test';
import net from 'net';

// Helper to check if the Astro dev server is already running on port 4321
const checkPort = () => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(4321);
  });
};

const portInUse = await checkPort();

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
  webServer: portInUse ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:4321/find-country-for-phd/',
    reuseExistingServer: true,
    timeout: 15 * 1000,
  },
});
