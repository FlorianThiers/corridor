#!/usr/bin/env node
/**
 * Lijst Supabase-migraties die in deze PR nieuw of gewijzigd zijn t.o.v. de basisbranch.
 * Met optionele SUPABASE_DB_URL_READONLY: welke daarvan nog niet in schema_migrations staan.
 * Voert nooit migraties uit.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '../..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const baseRef = process.env.GITHUB_BASE_REF
  ? `origin/${process.env.GITHUB_BASE_REF}`
  : (process.env.MIGRATION_BASE_REF ?? 'origin/develop')

function gitMergeBase() {
  try {
    return execFileSync('git', ['merge-base', 'HEAD', baseRef], {
      encoding: 'utf8',
      cwd: repoRoot,
    }).trim()
  } catch {
    return execFileSync('git', ['rev-parse', 'HEAD~1'], {
      encoding: 'utf8',
      cwd: repoRoot,
    }).trim()
  }
}

function migrationVersion(filename) {
  return filename.replace(/\.sql$/i, '')
}

function listChangedMigrations(mergeBase) {
  const out = execFileSync(
    'git',
    ['diff', '--name-status', `${mergeBase}...HEAD`, '--', 'supabase/migrations'],
    { encoding: 'utf8', cwd: repoRoot },
  ).trim()

  if (!out) return []

  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split('\t')
      const file = rest.join('\t')
      const base = path.basename(file)
      return { status, file: base, version: migrationVersion(base) }
    })
}

function queryUnapplied(versions) {
  const dbUrl = process.env.SUPABASE_DB_URL_READONLY
  if (!dbUrl || versions.length === 0) return null

  const unapplied = []
  for (const version of versions) {
    const sql = `SELECT COUNT(*) FROM supabase_migrations.schema_migrations WHERE version = '${version.replace(/'/g, "''")}';`
    try {
      const raw = execFileSync('psql', [dbUrl, '-v', 'ON_ERROR_STOP=1', '-tAc', sql], {
        encoding: 'utf8',
      }).trim()
      if (raw === '0') unapplied.push(version)
    } catch (err) {
      return { error: String(err?.message ?? err), unapplied: null }
    }
  }
  return { error: null, unapplied }
}

function renderMarkdown(changed, remote) {
  const lines = ['## Supabase-migratiecheck', '']
  lines.push(`Basis: \`${baseRef}\``)
  lines.push('')

  if (changed.length === 0) {
    lines.push('Geen nieuwe of gewijzigde migraties in deze PR.')
    return lines.join('\n')
  }

  lines.push('| Status | Bestand |')
  lines.push('| --- | --- |')
  for (const row of changed) {
    const label =
      row.status === 'A' ? 'nieuw' : row.status === 'M' ? 'gewijzigd' : row.status === 'D' ? 'verwijderd' : row.status
    lines.push(`| ${label} | \`${row.file}\` |`)
  }

  lines.push('')
  if (!process.env.SUPABASE_DB_URL_READONLY) {
    lines.push(
      '_Optioneel: zet repository secret `SUPABASE_DB_URL_READONLY` (read-only) om te tonen welke migraties nog niet op de database staan. Zonder secret wordt deze check niet uitgevoerd._',
    )
    return lines.join('\n')
  }

  if (remote?.error) {
    lines.push(`⚠️ Kon toegepaste migraties niet opvragen: ${remote.error}`)
    return lines.join('\n')
  }

  const candidates = changed.filter((r) => r.status !== 'D').map((r) => r.version)
  const unapplied = remote?.unapplied ?? []
  const pending = unapplied.filter((v) => candidates.includes(v))

  if (pending.length === 0) {
    lines.push('Alle PR-migraties (niet-verwijderd) staan al in `schema_migrations`, of er zijn geen pending versies.')
  } else {
    lines.push('**Nog niet toegepast op de read-only database:**')
    for (const v of pending) {
      lines.push(`- \`${v}\``)
    }
  }

  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(migrationsDir)) {
    const md = '## Supabase-migratiecheck\n\nGeen `supabase/migrations/` map in deze repo.'
    process.stdout.write(md)
    return
  }

  const mergeBase = gitMergeBase()
  const changed = listChangedMigrations(mergeBase)
  const versions = changed.filter((r) => r.status !== 'D').map((r) => r.version)
  const remote = queryUnapplied(versions)
  const md = renderMarkdown(changed, remote)
  process.stdout.write(md)

  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (summaryPath) {
    fs.appendFileSync(summaryPath, `${md}\n`)
  }
}

main()