/**
 * Client-grens voor de Supabase service-role client.
 * PR #29 maakt lib/supabase/admin.ts zelf server-only en haalt de publieke fallback weg.
 * Deze test blijft daar los van: geen clientcomponent mag de admin-client importeren.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const root = process.cwd()
const codeExt = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs'])
const skipDirs = new Set(['node_modules', '.next', '.git', 'out', 'dist', 'build', 'coverage'])

function walk(dir: string): string[] {
  const files: string[] = []
  for (const name of readdirSync(dir)) {
    if (skipDirs.has(name)) continue
    const full = join(dir, name)
    const info = statSync(full)
    if (info.isDirectory()) files.push(...walk(full))
    else if (codeExt.has(extname(name))) files.push(full)
  }
  return files
}

function isClientModule(source: string): boolean {
  return source.split('\n').slice(0, 8).some((line) => line.includes("'use client'") || line.includes('"use client"'))
}

const adminImport =
  /from\s+['"]@\/lib\/supabase\/admin['"]|from\s+['"][^'"]*supabase\/admin['"]|createAdminClient\s*\(/

const files = walk(root)
const clientOffenders: string[] = []
const importSites: string[] = []

for (const file of files) {
  const rel = relative(root, file)
  if (rel === 'lib/supabase/admin.ts') continue
  if (rel.endsWith('admin-client-guard.selftest.ts')) continue
  const source = readFileSync(file, 'utf8')
  const mentionsAdmin =
    source.includes('createAdminClient') ||
    source.includes('@/lib/supabase/admin') ||
    source.includes('supabase/admin')
  if (!mentionsAdmin) continue
  importSites.push(rel)
  if (isClientModule(source) || adminImport.test(source) && isClientModule(source)) {
    clientOffenders.push(rel)
  }
  if (isClientModule(source)) clientOffenders.push(rel)
}

assert.deepEqual(clientOffenders, [])

const isAllowedAdminImport = (rel: string) =>
  rel.startsWith('app/api/') ||
  rel === 'lib/supabase/admin.ts' ||
  rel === 'lib/media-supabase.ts'

const allowed = importSites.filter(isAllowedAdminImport)
assert.deepEqual(importSites, allowed)
assert.ok(importSites.includes('app/api/v1/agenda/import/route.ts'))
assert.ok(
  importSites.some(
    (rel) => rel === 'app/api/v1/media/route.ts' || rel === 'app/api/v1/media/[id]/route.ts',
  ),
)

const browserSurfaces = files.filter((file) => {
  const rel = relative(root, file)
  return rel.startsWith('components/') || rel.startsWith('hooks/') || rel.startsWith('app/')
})

const leaked: string[] = []
for (const file of browserSurfaces) {
  if (!isClientModule(readFileSync(file, 'utf8'))) continue
  const source = readFileSync(file, 'utf8')
  if (source.includes('SUPABASE_SERVICE_ROLE_KEY') || source.includes('createAdminClient')) {
    leaked.push(relative(root, file))
  }
}
assert.deepEqual(leaked, [])

console.log('admin-client-guard.selftest: ok')
