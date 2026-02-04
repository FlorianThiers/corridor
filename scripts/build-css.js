// Build script to compile Tailwind CSS
const postcss = require('postcss');
const tailwindcss = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const path = require('path');

async function buildCSS() {
  const inputFile = path.join(__dirname, '..', 'src', 'styles.css');
  const outputFile = path.join(__dirname, '..', 'css', 'styles.css');

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/bcf47e13-993b-46f6-b9a9-8094a0b71fbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-css.js:8',message:'buildCSS entry',data:{inputFile,outputFile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  try {
    // Ensure css directory exists
    const cssDir = path.join(__dirname, '..', 'css');
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bcf47e13-993b-46f6-b9a9-8094a0b71fbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-css.js:16',message:'CSS dir check',data:{cssDirExists:fs.existsSync(cssDir),inputFileExists:fs.existsSync(inputFile)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Read the input CSS file
    const css = fs.readFileSync(inputFile, 'utf8');

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bcf47e13-993b-46f6-b9a9-8094a0b71fbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-css.js:20',message:'Input CSS read',data:{cssLength:css.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Process with PostCSS
    const result = await postcss([tailwindcss, autoprefixer])
      .process(css, { from: inputFile, to: outputFile });
    
    // Write the output
    fs.writeFileSync(outputFile, result.css, 'utf8');
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bcf47e13-993b-46f6-b9a9-8094a0b71fbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-css.js:27',message:'CSS file written',data:{outputFileExists:fs.existsSync(outputFile),outputSize:fs.existsSync(outputFile)?fs.statSync(outputFile).size:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Write source map if available
    if (result.map) {
      fs.writeFileSync(outputFile + '.map', result.map.toString(), 'utf8');
    }
    
    console.log('✅ Tailwind CSS compiled successfully');
    console.log(`   Output: ${outputFile}`);
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bcf47e13-993b-46f6-b9a9-8094a0b71fbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-css.js:35',message:'buildCSS success',data:{outputFile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bcf47e13-993b-46f6-b9a9-8094a0b71fbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-css.js:37',message:'buildCSS error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('❌ Error compiling Tailwind CSS:', error.message);
    throw error;
  }
}

// If run directly, execute the function
if (require.main === module) {
  buildCSS().catch(error => {
    process.exit(1);
  });
}

// Export for use in other scripts
module.exports = buildCSS;
