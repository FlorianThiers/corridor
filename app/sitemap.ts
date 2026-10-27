import type { MetadataRoute } from 'next'

const SITE_URL = 'https://corridor.gent'

const PUBLIC_PATHS = [
  '/',
  '/agenda',
  '/activiteiten',
  '/evenementen',
  '/corridorfest',
  '/zones',
  '/geschiedenis',
  '/partners',
  '/corristories',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PUBLIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
