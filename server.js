// Custom server for History API routing support
const liveServer = require('live-server');
const path = require('path');
const fs = require('fs');
const url = require('url');

const params = {
    port: 8000,
    host: 'localhost',
    root: './',
    open: '/',
    ignore: 'node_modules',
    file: 'index.html', // Default file
    wait: 1000,
    logLevel: 2,
    middleware: [
        // Middleware to handle History API routing
        function(req, res, next) {
            const parsedUrl = url.parse(req.url);
            let pathname = parsedUrl.pathname;
            
            // Skip API requests, node_modules, and special paths
            // Also allow /pages/ directory to be served directly (for SPA page fragments)
            if (pathname.startsWith('/api/') || 
                pathname.startsWith('/node_modules/') ||
                pathname.startsWith('/.well-known/') ||
                pathname.startsWith('/supabase/') ||
                pathname.startsWith('/pages/')) {
                return next();
            }
            
            // Check if it's a static file request (has extension)
            const ext = path.extname(pathname).toLowerCase();
            const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.pdf', '.json', '.html'];
            
            // IMPORTANT: Always allow static files (especially .js, .css, .html) to be served directly
            // Don't redirect them to index.html
            if (ext && staticExtensions.includes(ext)) {
                // For static files, let live-server handle them normally
                // Don't check if they exist - let live-server return 404 if needed
                return next();
            }
            
            // For routes without extensions or non-existent HTML files, serve index.html (SPA fallback)
            // This allows the client-side router to handle the routing
            if (pathname !== '/index.html' && pathname !== '/') {
                req.url = '/index.html';
            }
            next();
        }
    ]
};

console.log('Starting server with History API routing support...');
console.log('Server will be available at http://localhost:8000');
liveServer.start(params);

