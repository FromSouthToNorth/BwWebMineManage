import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'tests/reports' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], locale: 'zh-CN' },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        locale: 'zh-CN',
      },
    },
  ],

  webServer: {
    command: 'node ./node_modules/vite/bin/vite.js --port 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
    timeout: 30000,
    cwd: '.',
  },
})
