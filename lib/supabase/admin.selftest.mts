// .mts so Node runs this as ESM without setting "type": "module" on the Next.js package.
// Run via `npm test` (needs --conditions=react-server so `server-only` does not throw).
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { createAdminClient } from './admin.ts'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts'])
const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'coverage',
  'dist',
  'build',
  'out',
])

/** Contiguous name of the leaked public env var. Split so this file does not contain it. */
const PUBLIC_SERVICE_ROLE_KEY = 'NEXT_PUBLIC_' + 'SUPABASE_SERVICE_ROLE_KEY'

const PUBLIC_SECRET =
  /NEXT_PUBLIC_[A-Z0-9_]*(?:SERVICE_ROLE|SERVICE_KEY|SECRET|PRIVATE_KEY|PASSWORD|TOKEN|API_KEY|ACCESS_KEY)/

const SUPABASE_URL = 'https://example.supabase.co'
const SERVER_KEY = 'server-service-role-key'

function withEnv(
  vars: Record<string, string | undefined>,
  fn: () => void,
) {
  const previous = new Map<string, string | undefined>()
  for (const name of Object.keys(vars)) {
    previous.set(name, process.env[name])
    const value = vars[name]
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
  try {
    fn()
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  }
}

function walk(dir: string): string[] {
  const files: string[] = []
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    const info = statSync(full)
    if (info.isDirectory()) files.push(...walk(full))
    else if (CODE_EXT.has(extname(name))) files.push(full)
  }
  return files
}

describe('createAdminClient', () => {
  it('throws when the server service role key is missing', () => {
    withEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: undefined,
        [PUBLIC_SERVICE_ROLE_KEY]: undefined,
      },
      () => {
        assert.throws(
          () => createAdminClient(),
          (error: unknown) => {
            assert.ok(error instanceof Error)
            assert.match(error.message, /SUPABASE_SERVICE_ROLE_KEY/)
            assert.doesNotMatch(error.message, new RegExp(PUBLIC_SERVICE_ROLE_KEY))
            return true
          },
        )
      },
    )
  })

  it('throws when the key is empty or whitespace', () => {
    for (const blank of ['', '   ', '\n']) {
      withEnv(
        {
          NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: blank,
          [PUBLIC_SERVICE_ROLE_KEY]: 'public-should-not-be-used',
        },
        () => {
          assert.throws(() => createAdminClient(), /SUPABASE_SERVICE_ROLE_KEY/)
        },
      )
    }
  })

  it('does not fall back to a NEXT_PUBLIC_ service role key', () => {
    withEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: undefined,
        [PUBLIC_SERVICE_ROLE_KEY]: 'public-service-role-key',
      },
      () => {
        assert.throws(() => createAdminClient(), /SUPABASE_SERVICE_ROLE_KEY/)
      },
    )
  })

  it('uses only the server key when a public service role key is also set', () => {
    withEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: SERVER_KEY,
        [PUBLIC_SERVICE_ROLE_KEY]: 'public-service-role-key',
      },
      () => {
        const client = createAdminClient() as unknown as {
          supabaseUrl?: string
          supabaseKey?: string
        }
        assert.equal(client.supabaseUrl, SUPABASE_URL)
        assert.equal(client.supabaseKey, SERVER_KEY)
      },
    )
  })

  it('throws when the Supabase URL is missing', () => {
    withEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        SUPABASE_SERVICE_ROLE_KEY: SERVER_KEY,
      },
      () => {
        assert.throws(() => createAdminClient(), /NEXT_PUBLIC_SUPABASE_URL/)
      },
    )
  })
})

describe('no public secrets', () => {
  it('admin client is marked server-only and does not read a public service role key', () => {
    const source = readFileSync(new URL('./admin.ts', import.meta.url), 'utf8')
    assert.match(source, /import 'server-only'/)
    assert.match(source, /SUPABASE_SERVICE_ROLE_KEY/)
    assert.doesNotMatch(source, new RegExp(PUBLIC_SERVICE_ROLE_KEY))
    assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY\s*\?\?/)
  })

  it('source files do not reference NEXT_PUBLIC_ secrets', () => {
    const offenders: string[] = []
    for (const file of walk(ROOT)) {
      const text = readFileSync(file, 'utf8')
      const matches = text.match(new RegExp(PUBLIC_SECRET.source, 'g'))
      if (matches) {
        offenders.push(`${relative(ROOT, file)}: ${matches.join(', ')}`)
      }
    }
    assert.deepEqual(offenders, [])
  })

  it('documents the Vercel variable Florian must set and the one to remove', () => {
    const example = readFileSync(join(ROOT, '.env.example'), 'utf8')
    const security = readFileSync(join(ROOT, 'SUPABASE_SECURITY.md'), 'utf8')

    assert.match(example, /^SUPABASE_SERVICE_ROLE_KEY=/m)
    assert.match(example, new RegExp(PUBLIC_SERVICE_ROLE_KEY))
    assert.match(security, /SUPABASE_SERVICE_ROLE_KEY/)
    assert.match(security, new RegExp(PUBLIC_SERVICE_ROLE_KEY))
    assert.match(security, /verwijder/i)

    for (const line of example.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      assert.doesNotMatch(
        trimmed,
        PUBLIC_SECRET,
        `active .env.example line looks like a public secret: ${trimmed}`,
      )
    }
  })
})
