require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkBucket() {
  console.log('Checking intro-animations bucket status...\n');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      return;
    }

    const introBucket = buckets.find(b => b.name === 'intro-animations');
    if (introBucket) {
      console.log('✅ intro-animations bucket exists!\n');

      // Check if there are files
      const { data: files, error: fileError } = await supabase.storage.from('intro-animations').list();
      if (fileError) {
        console.error('❌ Error listing files:', fileError.message);
      } else {
        console.log(`📁 Files in bucket: ${files.length}`);
        if (files.length > 0) {
          console.log('Latest files:');
          files.slice(0, 3).forEach(file => {
            console.log(`  - ${file.name} (${new Date(file.created_at).toLocaleDateString()})`);
          });
        } else {
          console.log('❌ No animation files uploaded yet');
          console.log('💡 Upload a video via /beheer-animatie to see it on the homepage');
        }
      }
    } else {
      console.log('❌ intro-animations bucket does NOT exist\n');
      console.log('📋 To create it manually:');
      console.log('1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/storage');
      console.log('2. Click "New bucket"');
      console.log('3. Name: intro-animations');
      console.log('4. Public bucket: ON');
      console.log('5. File size limit: 104857600 (100MB)');
      console.log('6. Allowed MIME types: video/mp4');
      console.log('7. Click "Create bucket"');
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

checkBucket();
