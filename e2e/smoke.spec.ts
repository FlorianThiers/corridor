import { expect, test } from '@playwright/test'

function attachConsoleErrorCollector(page: import('@playwright/test').Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

const publicGetPaths = ['/', '/agenda'] as const

for (const path of publicGetPaths) {
  test(`@smoke GET ${path} retourneert 200 zonder console-errors`, async ({ page }) => {
    const consoleErrors = attachConsoleErrorCollector(page)
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
    expect(response, `Geen response voor ${path}`).not.toBeNull()
    expect(response!.status(), `HTTP-status voor ${path}`).toBe(200)
    await expect(page.locator('body')).toBeVisible()
    expect(consoleErrors, `Console-errors op ${path}`).toEqual([])
  })
}

test('@smoke login-dialoog laadt (geen formulieractie)', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCollector(page)
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
  expect(response?.status()).toBe(200)

  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'Inloggen' }).click()

  await expect(page.locator('#login-modal.active')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Inloggen' })).toBeVisible()
  expect(consoleErrors, 'Console-errors bij login-dialoog').toEqual([])
})