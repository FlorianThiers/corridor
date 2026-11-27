import { expect, test } from '@playwright/test'

import { E2E_CREDIT_PHOTOGRAPHER, E2E_ZONES } from '../lib/supabase/e2e-fixtures'

const MEDIA_KEYS = [
  'id',
  'kind',
  'zone_slug',
  'url',
  'width',
  'height',
  'alt',
  'credit',
  'uploader_name',
  'artist_tag',
  'source',
  'license',
  'has_recognisable_people',
  'is_cover',
  'sort',
  'updated_at',
] as const

const KINDS = new Set(['zone', 'history', 'event'])
const SOURCES = new Set(['florian', 'upload', 'corristories'])

test.describe('/api/v1/media', () => {
  test('zonder sleutel 401, met testsleutel de afgesproken vorm', async ({ request }) => {
    const denied = await request.get('/api/v1/media')
    expect(denied.status()).toBe(401)
    expect(await denied.json()).toEqual({ error: 'Unauthorized' })

    const wrong = await request.get('/api/v1/media', {
      headers: { authorization: 'Bearer foute-sleutel' },
    })
    expect(wrong.status()).toBe(401)

    const response = await request.get('/api/v1/media?limit=50', {
      headers: { authorization: `Bearer ${process.env.CORRIDOR_MEDIA_API_KEY}` },
    })
    expect(response.status()).toBe(200)
    const body = (await response.json()) as {
      synced_at?: string
      items?: Record<string, unknown>[]
    }

    expect(body.synced_at).toEqual(expect.any(String))
    expect(Number.isNaN(Date.parse(body.synced_at ?? ''))).toBe(false)
    expect(Array.isArray(body.items)).toBe(true)
    expect(body.items!.length).toBeGreaterThan(0)
    expect(body.items!.length).toBeLessThanOrEqual(50)

    for (const item of body.items!) {
      for (const key of MEDIA_KEYS) {
        expect(item, `veld ${key}`).toHaveProperty(key)
      }
      expect(KINDS.has(String(item.kind))).toBe(true)
      expect(SOURCES.has(String(item.source))).toBe(true)
      expect(typeof item.url).toBe('string')
      expect(typeof item.is_cover).toBe('boolean')
      expect(typeof item.has_recognisable_people).toBe('boolean')
      expect(typeof item.sort).toBe('number')
      expect(Number.isNaN(Date.parse(String(item.updated_at)))).toBe(false)
    }

    const history = await request.get('/api/v1/media?kind=history&limit=5', {
      headers: { authorization: `Bearer ${process.env.CORRIDOR_MEDIA_API_KEY}` },
    })
    expect(history.status()).toBe(200)
    const historyBody = (await history.json()) as { items: { kind: string; url: string }[] }
    expect(historyBody.items.length).toBeGreaterThan(0)
    expect(historyBody.items.every((item) => item.kind === 'history')).toBe(true)
    expect(historyBody.items.every((item) => item.url.includes('/geschiedenis/'))).toBe(true)

    const zones = await request.get('/api/v1/media?kind=zone&zone=skatezone', {
      headers: { authorization: `Bearer ${process.env.CORRIDOR_MEDIA_API_KEY}` },
    })
    expect(zones.status()).toBe(200)
    const zoneBody = (await zones.json()) as {
      items: { kind: string; alt: string | null; credit: string | null; zone_slug: string | null }[]
    }
    expect(zoneBody.items.some((item) => item.kind === 'zone' && item.credit === E2E_CREDIT_PHOTOGRAPHER)).toBe(
      true,
    )
    expect(
      zoneBody.items.some((item) => item.alt?.includes(E2E_ZONES.skate.caption) && item.zone_slug === 'skatezone'),
    ).toBe(true)
    expect(zoneBody.items.some((item) => item.alt?.includes('wacht op moderatie'))).toBe(false)
  })
})
