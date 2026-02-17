/**
 * Diagnostic script to test Supabase video access
 * Run this in browser console on corridor.gent to diagnose video issues
 */

// Paste this in browser console on https://corridor.gent

async function diagnoseVideos() {
  console.log('🔍 Diagnosing video access...\n')
  
  // Check environment variables
  const supabaseUrl = process.env?.NEXT_PUBLIC_SUPABASE_URL || window.__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || window.__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('📋 Environment Variables:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
  console.log('  URL Value:', supabaseUrl || 'NOT FOUND')
  console.log('')
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!')
    console.log('Check Vercel Dashboard → Settings → Environment Variables')
    return
  }
  
  // Test buckets
  const buckets = ['animations', 'intro-animation', 'intro-animations', 'videos']
  
  console.log('📦 Testing Buckets:')
  
  for (const bucket of buckets) {
    try {
      const response = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucket}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`  ✅ ${bucket}:`, data.public ? 'Public' : 'Private', data.name)
      } else if (response.status === 404) {
        console.log(`  ❌ ${bucket}: Not found`)
      } else {
        console.log(`  ⚠️ ${bucket}: Error ${response.status}`)
      }
    } catch (error) {
      console.log(`  ❌ ${bucket}:`, error.message)
    }
  }
  
  console.log('')
  console.log('📹 Testing Video Files:')
  
  // Test specific buckets that code uses
  const testBuckets = [
    { name: 'animations', usedBy: 'HeroSection' },
    { name: 'intro-animation', usedBy: 'IntroAnimation' },
    { name: 'intro-animations', usedBy: 'IntroAnimation' }
  ]
  
  for (const { name: bucket, usedBy } of testBuckets) {
    try {
      const response = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucket}`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      
      if (response.ok) {
        const files = await response.json()
        if (files && files.length > 0) {
          console.log(`  ✅ ${bucket} (${usedBy}): ${files.length} file(s)`)
          files.slice(0, 3).forEach(file => {
            console.log(`     - ${file.name} (${file.metadata?.size || 'unknown size'})`)
          })
        } else {
          console.log(`  ⚠️ ${bucket} (${usedBy}): Empty bucket`)
        }
      } else if (response.status === 404) {
        console.log(`  ❌ ${bucket} (${usedBy}): Bucket not found`)
      } else {
        const error = await response.text()
        console.log(`  ❌ ${bucket} (${usedBy}): Error ${response.status} - ${error}`)
      }
    } catch (error) {
      console.log(`  ❌ ${bucket} (${usedBy}):`, error.message)
    }
  }
  
  console.log('')
  console.log('🌐 Testing CORS:')
  
  // Test CORS by trying to fetch a file
  try {
    const testUrl = `${supabaseUrl}/storage/v1/object/public/animations/test.mp4`
    const response = await fetch(testUrl, { method: 'HEAD' })
    console.log('  CORS test:', response.status === 200 || response.status === 404 ? '✅ OK' : `⚠️ ${response.status}`)
  } catch (error) {
    console.log('  CORS test: ❌', error.message)
  }
  
  console.log('')
  console.log('✅ Diagnosis complete!')
  console.log('Check the results above to identify the issue.')
}

// Run diagnosis
diagnoseVideos()
