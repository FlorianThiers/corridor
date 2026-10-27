import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo'

const PATHS = [
  '/',
  '/agenda',
  '/activiteiten',
  '/evenementen',
  '/zones',
  '/geschiedenis',
  '/partners',
  '/corristories',
  '/corridorfest',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`,
    changeFrequency: path === '/' || path === '/agenda' || path === '/activiteiten' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
