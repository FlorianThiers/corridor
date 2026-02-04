// Build script to compile Tailwind CSS
const postcss = require('postcss');
const tailwindcss = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');
const fs = require('fs');
const path = require('path');

async function buildCSS() {
  const inputFile = path.join(__dirname, '..', 'src', 'styles.css');
  const outputFile = path.join(__dirname, '..', 'css', 'styles.css');

  try {
    // Ensure css directory exists
    const cssDir = path.join(__dirname, '..', 'css');
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
    }

    // Read the input CSS file
    const css = fs.readFileSync(inputFile, 'utf8');

    // Process with PostCSS
    const result = await postcss([tailwindcss, autoprefixer])
      .process(css, { from: inputFile, to: outputFile });
    
    // Write the output
    fs.writeFileSync(outputFile, result.css, 'utf8');
    
    // Write source map if available
    if (result.map) {
      fs.writeFileSync(outputFile + '.map', result.map.toString(), 'utf8');
    }
    
    console.log('✅ Tailwind CSS compiled successfully');
    console.log(`   Output: ${outputFile}`);
  } catch (error) {
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
