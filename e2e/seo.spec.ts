import { expect, test } from '@playwright/test'

const PUBLIC_PATHS = [
  'https://corridor.gent',
  'https://corridor.gent/agenda',
  'https://corridor.gent/zones',
  'https://corridor.gent/corridorfest',
  'https://corridor.gent/geschiedenis',
  'https://corridor.gent/activiteiten',
  'https://corridor.gent/evenementen',
  'https://corridor.gent/partners',
]

test.describe('sitemap en robots', () => {
  test('sitemap.xml bevat de publieke pagina’s en geen beheer', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const xml = await response.text()
    expect(xml).toContain('<urlset')
    for (const url of PUBLIC_PATHS) {
      expect(xml).toContain(url)
    }
    expect(xml).not.toContain('/beheer')
    expect(xml).not.toContain('/debug')
    expect(xml).not.toContain('/api/')
  })

  test('robots.txt verwijst naar de sitemap en sluit beheer uit', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toMatch(/User-Agent:\s*\*/i)
    expect(text).toMatch(/Allow:\s*\//)
    expect(text).toMatch(/Disallow:\s*\/beheer/)
    expect(text).toMatch(/Disallow:\s*\/debug/)
    expect(text).toContain('Sitemap: https://corridor.gent/sitemap.xml')
  })
})
