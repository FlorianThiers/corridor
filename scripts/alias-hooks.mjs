import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = process.cwd()

function resolveTsFile(basePath) {
  const candidates = [`${basePath}.ts`, `${basePath}.tsx`, path.join(basePath, 'index.ts'), basePath]
  return (
    candidates.find((candidate) => {
      try {
        return existsSync(candidate) && statSync(candidate).isFile()
      } catch {
        return false
      }
    }) ?? null
  )
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const hit = resolveTsFile(path.join(root, specifier.slice(2)))
    if (!hit) throw new Error(`Cannot resolve ${specifier}`)
    return nextResolve(pathToFileURL(hit).href, context)
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    try {
      return await nextResolve(specifier, context)
    } catch (error) {
      const parent = context.parentURL ? new URL(specifier, context.parentURL) : null
      if (!parent || parent.protocol !== 'file:') throw error
      const hit = resolveTsFile(fileURLToPath(parent))
      if (!hit) throw error
      return nextResolve(pathToFileURL(hit).href, context)
    }
  }

  return nextResolve(specifier, context)
}
