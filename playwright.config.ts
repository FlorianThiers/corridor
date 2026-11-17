import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000'

const extraHTTPHeaders: Record<string, string> = {}
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
if (bypassSecret) {
  extraHTTPHeaders['x-vercel-protection-bypass'] = bypassSecret
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    locale: 'nl-BE',
    timezoneId: 'Europe/Brussels',
    ...(Object.keys(extraHTTPHeaders).length > 0 ? { extraHTTPHeaders } : {}),
  },
})
