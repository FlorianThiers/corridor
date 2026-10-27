import { defineConfig, devices } from '@playwright/test'

const PORT = 3000
const baseURL = `http://127.0.0.1:${PORT}`

/** Dummy waarden. De app praat in deze run niet met Supabase. */
const e2eEnv: Record<string, string> = {
  E2E_MOCK_SUPABASE: '1',
  NEXT_PUBLIC_E2E_MOCK_SUPABASE: '1',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'e2e-anon-key-not-a-secret',
  CORRIDOR_MEDIA_API_KEY: 'e2e-media-key',
  NEXT_PUBLIC_SITE_URL: baseURL,
  TZ: 'Europe/Brussels',
}

for (const [key, value] of Object.entries(e2eEnv)) {
  if (!process.env[key]) process.env[key] = value
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    locale: 'nl-BE',
    timezoneId: 'Europe/Brussels',
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: e2eEnv,
  },
})
