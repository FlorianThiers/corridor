import { expect, test } from '@playwright/test'

import { E2E_EMAIL, E2E_PASSWORD } from '../lib/supabase/e2e-fixtures'

async function openLogin(page: import('@playwright/test').Page) {
  await page.goto('/agenda')
  await page.getByRole('button', { name: 'Menu openen' }).click()
  await page.getByRole('button', { name: 'Inloggen' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Inloggen' })).toBeVisible()
  return dialog
}

test.describe('loginmodal', () => {
  test('weigert een fout wachtwoord en logt daarna in met de mock', async ({ page }) => {
    const dialog = await openLogin(page)

    await page.getByLabel('Email').fill(E2E_EMAIL)
    await page.locator('#login-password').fill('fout-wachtwoord')
    await dialog.getByRole('button', { name: 'Inloggen' }).click()
    await expect(dialog.getByText('Onjuist e-mailadres of wachtwoord.')).toBeVisible()

    await page.locator('#login-password').fill(E2E_PASSWORD)
    await dialog.getByRole('button', { name: 'Inloggen' }).click()
    await expect(dialog.getByText('Succesvol ingelogd!')).toBeVisible()
    await expect(dialog).toBeHidden({ timeout: 5_000 })

    await page.getByRole('button', { name: 'Menu openen' }).click()
    await expect(page.getByRole('link', { name: 'Profiel' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Inloggen' })).toHaveCount(0)
  })

  test('wisselt van tab en houdt de focus in de dialoog', async ({ page }) => {
    const dialog = await openLogin(page)

    await expect(page.getByRole('button', { name: 'Sluiten' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(dialog.getByRole('button', { name: 'Registreer hier' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Sluiten' })).toBeFocused()

    await dialog.getByRole('button', { name: 'Registreer hier' }).click()
    await expect(page.getByRole('heading', { name: 'Registreren' })).toBeVisible()
    await page.getByLabel('Naam').fill('E2E Bezoeker')
    await page.getByLabel('Email').fill(E2E_EMAIL)
    await page.locator('#signup-password').fill(E2E_PASSWORD)
    await dialog.getByRole('button', { name: 'Registreren' }).click()
    await expect(dialog.getByText(/Account aangemaakt/)).toBeVisible()

    await dialog.getByRole('button', { name: 'Log hier in' }).click()
    await dialog.getByRole('button', { name: 'Wachtwoord vergeten?' }).click()
    await expect(page.getByRole('heading', { name: 'Wachtwoord vergeten' })).toBeVisible()
    await page.getByLabel('Email').fill(E2E_EMAIL)
    await dialog.getByRole('button', { name: 'Verstuur reset link' }).click()
    await expect(dialog.getByText(/Reset link is verzonden/)).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})
