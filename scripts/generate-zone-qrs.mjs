/**
 * Zone QR codes in zone-omslag-kleuren + algemene pastel-regenboog.
 * Accenten afgeleid van titel/puzzelstuk op public/zones/*-cover.webp
 * (licht genoeg → iets donkerder voor scancontrast).
 *
 * Run: npm run generate:qr
 */
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'qr')
fs.mkdirSync(outDir, { recursive: true })

const base = 'https://corridor.gent'
const SIZE = 1024
const MARGIN_MODULES = 2
const LIGHT = '#ffffff'

/** Zone-nummer → brandkleur (omslag-accent, print-vriendelijk) */
const ZONE_COLORS = {
  1: '#d62839', // De Vloer — rood
  2: '#4f9a3e', // Viadunk — groen
  3: '#0aa8c4', // 't Veld — cyaan
  4: '#d4921a', // Corri Bar — goud
  5: '#b84d96', // De Bus — magenta
  6: '#3031c8', // Strongzone — indigo
  7: '#c4a800', // Parkour — geel
  8: '#8b5e3c', // Hilles — bruin
  9: '#2622b8', // RC17 — navy
  10: '#9aaa00', // Logistiek — lime
  11: '#5b2d8b', // Corri Arts — paars (regenboog-omslag)
  12: '#4a4a4a', // Lege zone — grijs/zwart
}

/** Pastel regenboog (iets dieper dan pure pastel → beter scanbaar op wit) */
const RAINBOW = [
  '#e07088', // roze
  '#e09060', // perzik
  '#c9a820', // geel
  '#5aab58', // mint/groen
  '#4a9ec8', // blauw
  '#7a68c8', // lila
  '#c068b8', // lavender
]

function pastelAt(t) {
  const n = RAINBOW.length
  const x = ((t % 1) + 1) % 1
  const i = x * (n - 1)
  const a = Math.floor(i)
  const b = Math.min(a + 1, n - 1)
  const f = i - a
  const parse = (hex) => {
    const h = hex.replace('#', '')
    return [0, 2, 4].map((o) => parseInt(h.slice(o, o + 2), 16))
  }
  const [r1, g1, b1] = parse(RAINBOW[a])
  const [r2, g2, b2] = parse(RAINBOW[b])
  const mix = (u, v) => Math.round(u + (v - u) * f)
  return `#${[mix(r1, r2), mix(g1, g2), mix(b1, b2)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function buildMatrix(url) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' })
  return qr.modules
}

function matrixToSvg(modules, colorFn) {
  const n = modules.size
  const total = n + MARGIN_MODULES * 2
  const cell = SIZE / total
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">`,
    `<rect width="100%" height="100%" fill="${LIGHT}"/>`,
  ]
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!modules.get(row, col)) continue
      const x = (col + MARGIN_MODULES) * cell
      const y = (row + MARGIN_MODULES) * cell
      const fill = colorFn(row, col, n)
      parts.push(
        `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="${fill}"/>`,
      )
    }
  }
  parts.push('</svg>')
  return parts.join('')
}

async function writeQr(fileBase, url, colorFn) {
  const modules = buildMatrix(url)
  const svg = matrixToSvg(modules, colorFn)
  const svgPath = path.join(outDir, `${fileBase}.svg`)
  const pngPath = path.join(outDir, `${fileBase}.png`)
  fs.writeFileSync(svgPath, svg, 'utf8')
  await sharp(Buffer.from(svg)).png().toFile(pngPath)
  console.log('ok', fileBase)
}

// Algemene QR: pastelregenboog diagonaal over modules
await writeQr('zones', `${base}/zones`, (row, col, n) => {
  const t = (row + col) / (2 * (n - 1))
  return pastelAt(t)
})

for (let i = 1; i <= 12; i++) {
  const color = ZONE_COLORS[i]
  await writeQr(`zone-${i}`, `${base}/zones/${i}`, () => color)
}

// Kleurenlegende voor admin/docs
fs.writeFileSync(
  path.join(outDir, 'zone-colors.json'),
  JSON.stringify({ general: 'pastel-rainbow', zones: ZONE_COLORS }, null, 2) + '\n',
)
console.log('wrote zone-colors.json')
