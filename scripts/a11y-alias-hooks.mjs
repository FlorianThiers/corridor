/**
 * Lost @/ op naar de repo-root en voegt .ts toe.
 * Node ESM laadt selftests alleen met een expliciete extensie.
 * Apart van scripts/selftest-register.mjs in PR #27.
 */
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const EXTENSIONS = ['.ts', '.tsx', '.mjs', '.js']

function fileWithExtension(url) {
  const path = fileURLToPath(url)
  if (EXTENSIONS.some((ext) => path.endsWith(ext)) && existsSync(path)) return url.href
  for (const ext of EXTENSIONS) {
    if (existsSync(path + ext)) return `${url.href}${ext}`
  }
  for (const ext of EXTENSIONS) {
    const indexUrl = new URL(`index${ext}`, url.href.endsWith('/') ? url : `${url.href}/`)
    if (existsSync(fileURLToPath(indexUrl))) return indexUrl.href
  }
  return null
}

export async function resolve(specifier, context, nextResolve) {
  let url = null
  if (specifier.startsWith('@/')) {
    url = new URL(`../${specifier.slice(2)}`, import.meta.url)
  } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    url = new URL(specifier, context.parentURL)
  }

  if (url) {
    const resolved = fileWithExtension(url)
    if (resolved) return nextResolve(resolved, context)
  }

  return nextResolve(specifier, context)
}
