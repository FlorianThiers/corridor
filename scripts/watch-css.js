// Watch script to automatically rebuild Tailwind CSS on file changes
const chokidar = require('chokidar');
const { spawn } = require('child_process');
const path = require('path');

const watchPaths = [
  path.join(__dirname, '..', 'index.html'),
  path.join(__dirname, '..', 'pages', '**', '*.html'),
  path.join(__dirname, '..', 'js', '**', '*.js'),
  path.join(__dirname, '..', 'src', 'styles.css'),
];

let buildTimeout;
let isBuilding = false;

function buildCSS() {
  if (isBuilding) {
    return;
  }
  
  isBuilding = true;
  console.log('🔄 Rebuilding CSS...');
  
  const buildProcess = spawn('node', [path.join(__dirname, 'build-css.js')], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });
  
  buildProcess.on('close', (code) => {
    isBuilding = false;
    if (code === 0) {
      console.log('✅ CSS rebuilt successfully\n');
    } else {
      console.error('❌ CSS build failed\n');
    }
  });
}

// Initial build
console.log('📦 Building CSS initially...');
buildCSS();

// Watch for changes
const watcher = chokidar.watch(watchPaths, {
  ignored: /node_modules/,
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', (path) => {
  console.log(`📝 File changed: ${path}`);
  // Debounce: wait 300ms after last change before rebuilding
  clearTimeout(buildTimeout);
  buildTimeout = setTimeout(() => {
    buildCSS();
  }, 300);
});

watcher.on('add', (path) => {
  console.log(`➕ File added: ${path}`);
  clearTimeout(buildTimeout);
  buildTimeout = setTimeout(() => {
    buildCSS();
  }, 300);
});

console.log('👀 Watching for changes...');
console.log('   Watching:', watchPaths.map(p => p.replace(__dirname + '/../', '')).join(', '));
console.log('   Press Ctrl+C to stop\n');
