import { expect, type Page, test } from '@playwright/test'

import { E2E_AGENDA } from '../lib/supabase/e2e-fixtures'

async function expectDutchMonthHeading(page: Page) {
  const heading = page.locator('#agenda-maand')
  await expect(heading).toHaveText(
    /^(Januari|Februari|Maart|April|Mei|Juni|Juli|Augustus|September|Oktober|November|December) \d{4}$/,
  )
  return heading
}

test.describe('agenda', () => {
  test('toont de maandlijst, sportfilter en kalender in het Nederlands', async ({ page }) => {
    await page.goto('/agenda')

    await expect(page.getByRole('heading', { level: 1, name: 'Agenda' })).toBeVisible()
    await expectDutchMonthHeading(page)
    await expect(page.getByRole('heading', { name: 'Deze maand', level: 3 })).toBeVisible()

    await expect(page.getByRole('heading', { name: E2E_AGENDA.basketbal.title })).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_AGENDA.wandelvoetbal.title })).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_AGENDA.fest.title })).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_AGENDA.nextMonth.title })).toHaveCount(0)

    const filter = page.getByRole('navigation', { name: 'Filter op sport' })
    await expect(filter.getByRole('link', { name: 'Alle sporten' })).toHaveAttribute('aria-current', 'true')

    const basketbalDay = page.getByRole('button', {
      name: new RegExp(`${E2E_AGENDA.basketbal.day} .*1 item.*Basketbal`),
    })
    await expect(basketbalDay).toBeVisible()
    await basketbalDay.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator(':focus')).toHaveAccessibleName(
      new RegExp(`\\b${E2E_AGENDA.basketbal.day + 1}\\b`),
    )

    await basketbalDay.click()
    await expect(page.getByRole('heading', { name: /Agenda op / })).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_AGENDA.basketbal.title })).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_AGENDA.wandelvoetbal.title })).toHaveCount(0)
  })

  test('filtert de lijst en de kalender op sport', async ({ page }) => {
    await page.goto('/agenda')

    await page.getByRole('link', { name: 'Basketbal', exact: true }).click()
    await expect(page).toHaveURL(/sport=basketbal/)
    await expect(page.getByRole('link', { name: 'Basketbal', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(page.getByRole('heading', { name: E2E_AGENDA.basketbal.title })).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_AGENDA.wandelvoetbal.title })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: E2E_AGENDA.fest.title })).toHaveCount(0)

    await page.getByRole('link', { name: 'Dans', exact: true }).click()
    await expect(page).toHaveURL(/sport=dans/)
    await expect(page.getByText('Geen items deze maand voor deze sport.')).toBeVisible()

    await page.getByRole('link', { name: 'Alle sporten' }).click()
    await expect(page).toHaveURL(/\/agenda$/)
    await expect(page.getByRole('heading', { name: E2E_AGENDA.wandelvoetbal.title })).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_AGENDA.fest.title })).toBeVisible()
  })

  test('bladert met het toetsenbord naar de volgende maand', async ({ page }) => {
    await page.goto('/agenda')
    const heading = await expectDutchMonthHeading(page)
    const current = (await heading.innerText()).trim()

    const next = page.getByRole('button', { name: 'Volgende maand' })
    await next.focus()
    await page.keyboard.press('Enter')

    await expect(heading).not.toHaveText(current)
    await expect(page.getByRole('heading', { name: E2E_AGENDA.nextMonth.title })).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_AGENDA.basketbal.title })).toHaveCount(0)

    await page.getByRole('button', { name: 'Vorige maand' }).click()
    await expect(heading).toHaveText(current)
    await expect(page.getByRole('heading', { name: E2E_AGENDA.basketbal.title })).toBeVisible()
  })
})
