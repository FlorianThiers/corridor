import type { MetadataRoute } from 'next'

const SITE_URL = 'https://corridor.gent'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/beheer', '/debug', '/api/', '/profiel'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
