import { expect, test } from '@playwright/test'

import {
  E2E_CREDIT_ARTIST,
  E2E_CREDIT_PHOTOGRAPHER,
  E2E_ZONES,
} from '../lib/supabase/e2e-fixtures'

async function openLightbox(page: import('@playwright/test').Page, name: RegExp) {
  await page.getByRole('button', { name }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('galerijen', () => {
  test('zones-overzicht linkt naar een zonegalerij met lightbox en credits', async ({ page }) => {
    await page.goto('/zones')

    await expect(page.getByRole('heading', { level: 1, name: 'Zones' })).toBeVisible()
    const skate = page.getByRole('link', { name: `Zone ${E2E_ZONES.skate.number}: ${E2E_ZONES.skate.name}` })
    const fest = page.getByRole('link', { name: `Zone ${E2E_ZONES.fest.number}: ${E2E_ZONES.fest.name}` })
    await expect(skate).toBeVisible()
    await expect(fest).toBeVisible()
    await expect(page.getByText('Deze foto wacht op moderatie')).toHaveCount(0)

    await skate.click()
    await expect(page).toHaveURL(`/zones/${E2E_ZONES.skate.number}`)
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: `Zone ${E2E_ZONES.skate.number}: ${E2E_ZONES.skate.name}`,
      }),
    ).toBeVisible()
    await expect(page.getByText(E2E_ZONES.skate.caption)).toBeVisible()
    await expect(page.getByText(/van 1 foto/)).toBeVisible()

    const dialog = await openLightbox(
      page,
      new RegExp(`Vergroot foto: ${E2E_ZONES.skate.caption}`),
    )
    await expect(dialog.locator('#lightbox-caption')).toContainText(`kunstenaar: ${E2E_CREDIT_ARTIST}`)
    await expect(dialog.locator('#lightbox-caption')).toContainText(E2E_CREDIT_PHOTOGRAPHER)

    await page.keyboard.press('+')
    await expect(dialog.getByText('115%')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('festgalerij toont credits en opent de lightbox', async ({ page }) => {
    await page.goto('/corridorfest')

    await expect(page.getByRole('heading', { level: 2, name: /Foto.s editie 2026/ })).toBeVisible()
    await expect(page.getByText(E2E_ZONES.fest.caption)).toBeVisible()

    const dialog = await openLightbox(
      page,
      new RegExp(`Vergroot foto: ${E2E_ZONES.fest.caption}`),
    )
    await expect(dialog.locator('#lightbox-caption')).toContainText(E2E_CREDIT_PHOTOGRAPHER)
    await page.getByRole('button', { name: 'Sluiten' }).click()
    await expect(dialog).toBeHidden()

    await page.getByRole('link', { name: /Alle fest-foto/ }).click()
    await expect(page).toHaveURL(`/zones/${E2E_ZONES.fest.number}`)
    await expect(page.getByText(E2E_ZONES.fest.caption)).toBeVisible()
  })

  test('geschiedenisgalerij toont de credit en opent het volledige beeld met het toetsenbord', async ({
    page,
  }) => {
    await page.goto('/geschiedenis')

    await expect(page.getByRole('heading', { level: 1, name: 'Het Verhaal van Corridor' })).toBeVisible()

    const card = page.getByRole('button', { name: /Sofie D\./ }).first()
    await expect(card).toBeVisible()
    await expect(card).toHaveAccessibleName(/Sofie D\./)
    await expect(card.getByText('Sofie D.')).toBeVisible()

    await card.focus()
    await page.keyboard.press('Enter')
    await expect(card).toHaveAttribute('aria-expanded', 'true')
    await expect(card).toHaveAccessibleName(/volledig beeld/)

    await page.keyboard.press('Escape')
    await expect(card).toHaveAttribute('aria-expanded', 'false')
  })
})
