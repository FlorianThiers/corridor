import sharp from 'sharp'

const logo = 'public/LogoCorridor-corri-dor-d-no-oval.png'
const size = 512
const pad = Math.round(size * 0.11)

const logoResized = await sharp(logo)
  .resize(Math.round(size * 0.78), Math.round(size * 0.78), {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer()

const eggSvg = Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#fff8fc"/>
      <stop offset="70%" stop-color="#ffe4f0"/>
      <stop offset="100%" stop-color="#fbcfe8"/>
    </radialGradient>
  </defs>
  <ellipse cx="50%" cy="50%" rx="48%" ry="46%" fill="url(#g)"/>
</svg>`)

const eggBg = await sharp(eggSvg).png().toBuffer()

const favicon = await sharp({
  create: {
    width: size,
    height: size,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: eggBg, left: 0, top: 0 },
    { input: logoResized, left: pad, top: pad },
  ])
  .png()
  .toBuffer()

await sharp(favicon).webp({ quality: 92, alphaQuality: 100 }).toFile('public/favicon.webp')
await sharp(favicon).resize(180, 180).png().toFile('public/apple-touch-icon.png')
await sharp(favicon).resize(32, 32).png().toFile('public/favicon-32.png')
await sharp(favicon).resize(512, 512).webp({ quality: 92 }).toFile('public/LogoCorridor.webp')

const m = await sharp('public/favicon.webp').metadata()
console.log('favicon ok', m.width, 'alpha=' + m.hasAlpha)
