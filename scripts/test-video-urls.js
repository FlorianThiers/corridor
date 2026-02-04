/**
 * Test script om Supabase Storage video URLs te verifiëren
 * 
 * Gebruik: node scripts/test-video-urls.js
 * 
 * Zorg dat je .env.local hebt met:
 * NEXT_PUBLIC_SUPABASE_URL=...
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 */

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  console.error('Zorg dat .env.local bestaat met:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
  process.exit(1)
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ Kon project reference niet vinden in Supabase URL')
  process.exit(1)
}

console.log('🔍 Testing Supabase Storage video URLs...\n')
console.log(`Project Reference: ${projectRef}\n`)

const videos = [
  { name: 'VideoGuillaume.mp4', bucket: 'videos' },
  { name: 'corridorGif.mp4', bucket: 'videos' },
  { name: 'AnimatieFlyer.mp4', bucket: 'videos' },
]

const baseUrl = `https://${projectRef}.supabase.co/storage/v1/object/public`

console.log('📹 Video URLs:\n')
videos.forEach(({ name, bucket }) => {
  const url = `${baseUrl}/${bucket}/${name}`
  console.log(`  ${name}:`)
  console.log(`    ${url}\n`)
})

console.log('\n✅ Test deze URLs in je browser om te verifiëren dat ze werken')
console.log('✅ Check ook dat de file namen exact overeenkomen (case-sensitive)')
