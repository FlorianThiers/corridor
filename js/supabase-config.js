// Supabase Configuration
// This file can load config from .env file at runtime for development
// For production, values are injected at build time

// Default configuration (will be overridden by runtime loading if available)
const config = {
    SUPABASE_URL: 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY'
};

// Function to load config from .env file (development only)
async function loadConfigFromEnv() {
    try {
        // Only try to load .env in development/local environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const response = await fetch('/.env');
            if (response.ok) {
                const envContent = await response.text();
                const envVars = parseEnvContent(envContent);

                if (envVars.SUPABASE_URL) config.SUPABASE_URL = envVars.SUPABASE_URL;
                if (envVars.SUPABASE_ANON_KEY) config.SUPABASE_ANON_KEY = envVars.SUPABASE_ANON_KEY;

                console.log('✅ Loaded Supabase config from .env file');
            }
        }
    } catch (error) {
        console.log('ℹ️  Using default Supabase configuration (production mode)');
    }
}

// Simple .env parser
function parseEnvContent(content) {
    const vars = {};
    const lines = content.split('\n');

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
                vars[key.trim()] = value;
            }
        }
    });

    return vars;
}

// Initialize Supabase client
async function initializeSupabase() {
    // Load config from .env if available (development)
    await loadConfigFromEnv();

if (typeof supabase !== 'undefined') {
    const { createClient } = supabase;
        window.supabaseClient = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
} else {
        console.error('❌ Supabase library not loaded. Make sure @supabase/supabase-js is loaded before this script.');
    }
}

// Initialize immediately
initializeSupabase();