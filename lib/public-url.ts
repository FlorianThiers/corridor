export function resolvePublicBaseUrl(requestOrigin?: string | null): string {
  const explicit = process.env.CORRIDOR_SITE_URL?.replace(/\/$/, '')
  if (explicit) return explicit
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, '')
  }
  return ''
}

export function toAbsoluteUrl(baseUrl: string, href: string): string {
  if (/^https?:\/\//i.test(href)) return href
  if (!baseUrl) return href
  return `${baseUrl}${href.startsWith('/') ? href : `/${href}`}`
}
