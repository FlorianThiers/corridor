import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'qr')
fs.mkdirSync(outDir, { recursive: true })

const base = 'https://corridor.gent'
const pink = '#ec4899'
const dark = '#1f2937'

const items = [
  { file: 'zones', url: `${base}/zones` },
  ...Array.from({ length: 12 }, (_, i) => ({
    file: `zone-${i + 1}`,
    url: `${base}/zones/${i + 1}`,
  })),
]

for (const item of items) {
  await QRCode.toFile(path.join(outDir, `${item.file}.png`), item.url, {
    type: 'png',
    width: 1024,
    margin: 2,
    color: { dark, light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })
  await QRCode.toFile(path.join(outDir, `${item.file}.svg`), item.url, {
    type: 'svg',
    width: 1024,
    margin: 2,
    color: { dark: pink, light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })
  console.log('ok', item.file)
}
