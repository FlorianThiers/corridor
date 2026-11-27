import { expect, test } from '@playwright/test'

test.describe('skiplink en toetsenbordnavigatie', () => {
  test('skiplink verplaatst de focus naar de inhoud', async ({ page }) => {
    await page.goto('/agenda')

    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Ga naar de inhoud' })
    await expect(skip).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.locator('#inhoud')).toBeFocused()
  })

  test('het hoofdmenu opent, vangt Tab en sluit met Escape', async ({ page }) => {
    await page.goto('/agenda')

    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const menu = page.locator('button[aria-controls="site-navigatie"]')
    await expect(menu).toBeFocused()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('Enter')
    await expect(menu).toHaveAttribute('aria-expanded', 'true')

    const nav = page.getByRole('navigation', { name: 'Hoofdmenu' })
    await expect(nav.getByRole('button', { name: 'Inloggen' })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(menu).toBeFocused()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
  })
})
