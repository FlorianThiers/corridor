// Simple Router for Corridor Website - Using History API
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = '';
        this.init();
    }

    init() {
        // Define routes
        this.routes = {
            '/': 'pages/home.html',
            '/home': 'pages/home.html',
            '/evenementen': 'pages/evenementen.html',
            '/agenda': 'pages/agenda.html',
            '/corristories': 'pages/corristories.html',
            '/partners': 'pages/partners.html',
            '/profiel': 'pages/profiel.html',
            '/admin': 'pages/admin.html',
            '/admin/evenementen': 'pages/admin-evenementen.html',
            '/admin/corristories': 'pages/admin-corristories.html',
            '/admin/zones': 'pages/admin-zones.html',
            '/admin/gebruikers': 'pages/admin-gebruikers.html',
            '/admin/partners': 'pages/admin-partners.html'
        };

        // Check if History API is supported
        if (!window.history || !window.history.pushState) {
            console.warn('History API not supported, falling back to hash routing');
            this.useHashRouting = true;
        } else {
            this.useHashRouting = false;
        }

        // Intercept link clicks to use History API or hash routing
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="/"]');
            if (link && !link.hasAttribute('target') && !link.hasAttribute('download')) {
                e.preventDefault();
                const path = link.getAttribute('href');
                this.navigate(path);
            }
        });

        // Listen for popstate (back/forward buttons) or hashchange
        if (this.useHashRouting) {
            window.addEventListener('hashchange', () => this.handleRoute());
        } else {
            window.addEventListener('popstate', () => this.handleRoute());
        }
        
        // Handle initial route
        // Wait a bit for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.handleRoute(), 100);
            });
        } else {
            setTimeout(() => this.handleRoute(), 100);
        }
    }

    async handleRoute() {
        // Support both History API and hash routing as fallback
        let path;
        if (this.useHashRouting) {
            path = window.location.hash.slice(1) || '/';
        } else {
            path = window.location.pathname || '/';
        }
        const route = path.split('?')[0]; // Remove query params
        
        // Protect admin routes - only allow admins
        if (route.startsWith('/admin')) {
            // Wait for authManager to be ready and user to be loaded
            let attempts = 0;
            const maxAttempts = 30; // 3 seconds max wait
            let hasSession = false;
            let definitelyNotAdmin = false;
            
            while (attempts < maxAttempts) {
                // Check if authManager exists
                if (window.authManager && typeof window.authManager.isAdmin === 'function') {
                    // Check if user is admin
                    if (window.authManager.isAdmin()) {
                        // User is admin, allow access
                        break;
                    }
                    
                    // Check if user profile is loaded and they're not admin
                    if (window.authManager.currentUser) {
                        // User profile is loaded, check if they're admin
                        if (!window.authManager.isAdmin()) {
                            // User is authenticated but not admin - definitely deny
                            definitelyNotAdmin = true;
                            break;
                        }
                        // If we get here, user is admin
                        break;
                    }
                }
                
                // Check session if available (to see if user is logged in at all)
                if (window.supabaseClient && !hasSession) {
                    try {
                        const { data: { session } } = await window.supabaseClient.auth.getSession();
                        if (!session) {
                            // No session, definitely not admin
                            definitelyNotAdmin = true;
                            break;
                        }
                        hasSession = true;
                        // Session exists, but profile might not be loaded yet, continue waiting
                    } catch (error) {
                        // Error checking session, continue waiting
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            // Only deny access if we're certain the user is not admin
            if (definitelyNotAdmin) {
                console.warn('Admin access denied: User is not admin');
                this.navigate('/');
                return;
            }
            
            // If authManager is not available after waiting, check session
            if (!window.authManager || typeof window.authManager.isAdmin !== 'function') {
                // Check one more time with session
                if (window.supabaseClient) {
                    try {
                        const { data: { session } } = await window.supabaseClient.auth.getSession();
                        if (!session) {
                            console.warn('Admin access denied: No session');
                            this.navigate('/');
                            return;
                        }
                        // Session exists, allow page to load and let page-level check handle it
                        // The page itself will check admin access and show/hide content accordingly
                    } catch (error) {
                        console.warn('Admin access denied: Error checking session');
                        this.navigate('/');
                        return;
                    }
                } else {
                    console.warn('Admin access denied: authManager and supabaseClient not available');
                    this.navigate('/');
                    return;
                }
            } else {
                // authManager exists, check admin status
                // Only deny if profile is loaded AND user is not admin/programmer
                if (window.authManager.currentUser && !window.authManager.isAdmin()) {
                    // Profile is loaded and user is definitely not admin/programmer
                    console.warn('Admin access denied: User is not admin/programmer');
                    this.navigate('/');
                    return;
                }
                // If profile not loaded yet OR user is admin/programmer, allow page to load
                // The page itself will check admin access and show/hide content accordingly
            }
        }
        
        // Load HTML files
        if (this.routes[route]) {
            this.currentRoute = route;
            await this.loadPage(this.routes[route]);
            this.updateActiveNav();
        } else {
            // Default to home
            this.currentRoute = '/';
            await this.loadPage(this.routes['/']);
            this.updateActiveNav();
        }
    }

    async executeScriptsSequentially(scriptsToExecute, index, onComplete) {
        if (index >= scriptsToExecute.length) {
            // All scripts executed, call completion callback
            if (onComplete && typeof onComplete === 'function') {
                setTimeout(() => {
                    onComplete();
                }, 50);
            }
            return;
        }
        
        const scriptInfo = scriptsToExecute[index];
        
        if (!scriptInfo) {
            // Skip invalid script info
            this.executeScriptsSequentially(scriptsToExecute, index + 1);
            return;
        }
        
        if (scriptInfo.src) {
            // External script - load dynamically
            try {
                const scriptElement = document.createElement('script');
                scriptElement.src = scriptInfo.src;
                scriptElement.async = false;
                    scriptElement.onerror = () => {
                        console.error(`Error loading external script ${index}:`, scriptInfo.src);
                        // Continue with next script even if this one fails
                        setTimeout(() => {
                            this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                        }, 0);
                    };
                    scriptElement.onload = () => {
                        // Continue with next script after this one loads
                        setTimeout(() => {
                            this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                        }, 0);
                    };
                if (document.head) {
                    document.head.appendChild(scriptElement);
                } else {
                    console.error('document.head not available');
                    this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                }
            } catch (error) {
                console.error(`Error creating external script element ${index}:`, error);
                this.executeScriptsSequentially(scriptsToExecute, index + 1);
            }
        } else if (scriptInfo.content && typeof scriptInfo.content === 'string') {
            // Inline script - validate content first
            let content = scriptInfo.content.trim();
            
            // Validate content is not empty
            if (!content || content.length === 0) {
                // Skip empty scripts silently
                this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                return;
            }
            
            // Debug: Log script info (only in development)
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log(`Executing script ${index}, length: ${content.length}`);
            }
            
            // Validate content looks like valid JavaScript (basic check)
            // Check for common issues that cause "Unexpected end of input"
            const openBraces = (content.match(/{/g) || []).length;
            const closeBraces = (content.match(/}/g) || []).length;
            const openParens = (content.match(/\(/g) || []).length;
            const closeParens = (content.match(/\)/g) || []).length;
            const openBrackets = (content.match(/\[/g) || []).length;
            const closeBrackets = (content.match(/\]/g) || []).length;
            
            // Check for unbalanced brackets (common cause of "Unexpected end of input")
            if (Math.abs(openBraces - closeBraces) > 0 || 
                Math.abs(openParens - closeParens) > 0 || 
                Math.abs(openBrackets - closeBrackets) > 0) {
                console.warn(`Script ${index} has unbalanced brackets/parentheses. This may cause execution errors.`);
                console.warn(`Braces: ${openBraces}/${closeBraces}, Parens: ${openParens}/${closeParens}, Brackets: ${openBrackets}/${closeBrackets}`);
            }
            
            // Try using Function constructor first (most reliable for inline scripts)
            try {
                // Wrap in try-catch to handle any execution errors gracefully
                const func = new Function(content);
                func();
                // Success - continue with next script
                setTimeout(() => {
                    this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                }, 0);
                return; // Exit early on success
            } catch (funcError) {
                // Function constructor failed - log but don't fail completely
                if (funcError.message.includes('Unexpected end of input')) {
                    console.error(`Script ${index} appears to be incomplete or malformed. Content preview:`, content.substring(0, 300));
                }
                console.warn(`Function constructor failed for script ${index}, trying alternative method:`, funcError.message);
                
                // Try eval as fallback (less safe but sometimes works)
                try {
                    // Use eval in strict mode for better error handling
                    eval('"use strict";\n' + content);
                    setTimeout(() => {
                        this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                    }, 0);
                    return; // Exit early on success
                } catch (evalError) {
                    console.warn(`Eval also failed for script ${index}, trying script element:`, evalError.message);
                    // Both Function and eval failed - try script element method as last resort
                    try {
                        // Ensure document.body exists
                        if (!document.body) {
                            // Wait for body to be available (max 1 second)
                            let bodyWaitAttempts = 0;
                            const maxBodyWaitAttempts = 100;
                            const checkBody = setInterval(() => {
                                bodyWaitAttempts++;
                                if (document.body) {
                                    clearInterval(checkBody);
                                    try {
                                        const scriptElement = document.createElement('script');
                                        scriptElement.type = 'text/javascript';
                                        scriptElement.textContent = content;
                                        document.body.appendChild(scriptElement);
                                        setTimeout(() => {
                                            this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                                        }, 0);
                                    } catch (error) {
                                        console.error(`Error executing inline script ${index} via script element (after body wait):`, error);
                                        console.error('Script content length:', content.length);
                                        this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                                    }
                                } else if (bodyWaitAttempts >= maxBodyWaitAttempts) {
                                    clearInterval(checkBody);
                                    console.error(`Timeout waiting for document.body for script ${index}`);
                                    this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                                }
                            }, 10);
                            return;
                        }
                        
                        // document.body exists, create script element
                        try {
                            // Validate content before creating element
                            if (!content || typeof content !== 'string' || content.length === 0) {
                                throw new Error('Invalid script content');
                            }
                            
                            const scriptElement = document.createElement('script');
                            scriptElement.type = 'text/javascript';
                            
                            // Set content carefully
                            try {
                                scriptElement.textContent = content;
                            } catch (textError) {
                                // If setting textContent fails, try innerHTML
                                scriptElement.innerHTML = content;
                            }
                            
                            // Validate script element has content
                            if (!scriptElement.textContent && !scriptElement.innerHTML) {
                                throw new Error('Script element has no content after setting');
                            }
                            
                            // Try to append - wrap in additional try-catch for appendChild specifically
                            try {
                                if (!document.body) {
                                    throw new Error('document.body is null');
                                }
                                document.body.appendChild(scriptElement);
                            } catch (appendError) {
                                // If appendChild fails, try appending to head instead
                                if (document.head) {
                                    document.head.appendChild(scriptElement);
                                } else {
                                    throw appendError;
                                }
                            }
                            
                            // Continue with next script immediately for inline scripts
                            setTimeout(() => {
                                this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                            }, 0);
                        } catch (appendError) {
                            // All methods failed - log and continue
                            console.warn(`Could not execute script ${index} via script element (this is usually OK if Function/eval worked):`, appendError.message);
                            // Continue with next script even if this one fails
                            this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                        }
                    } catch (scriptElementError) {
                        console.error(`Error executing inline script ${index} (all methods failed):`, scriptElementError);
                        console.error('Script content length:', content.length);
                        console.error('Script content preview:', content.substring(0, 200) + '...');
                        // Continue with next script even if this one fails
                        this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
                    }
                }
            }
        } else {
            // Skip empty or invalid scripts
            this.executeScriptsSequentially(scriptsToExecute, index + 1, onComplete);
        }
    }

    async loadPage(pagePath) {
        try {
            const response = await fetch(pagePath);
            if (!response.ok) {
                throw new Error(`Failed to load page: ${pagePath}`);
            }
            const html = await response.text();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                // Parse HTML and execute scripts
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Get all script tags using DOMParser (most reliable method)
                const scripts = doc.querySelectorAll('script');
                const scriptsToExecute = [];
                
                scripts.forEach((script, scriptIndex) => {
                    // Skip live-reload scripts injected by live-server
                    const scriptContent = script.textContent || script.innerHTML || '';
                    const scriptSrc = script.src || '';
                    
                    // Check if this is a live-reload script
                    if (scriptContent.includes('Live reload enabled') || 
                        scriptContent.includes('live-server') ||
                        scriptContent.includes('WebSocket') && scriptContent.includes('refreshCSS') ||
                        scriptSrc.includes('livereload') ||
                        scriptSrc.includes('live-server')) {
                        // Skip live-reload scripts
                        script.remove();
                        return;
                    }
                    
                    // Skip empty scripts
                    if (!script.src && (!scriptContent || scriptContent.trim() === '')) {
                        script.remove();
                        return;
                    }
                    
                    // Get script content - try multiple methods to ensure we get full content
                    let content = '';
                    
                    // Method 1: Try textContent first (most reliable, strips HTML but preserves JS)
                    if (script.textContent && script.textContent.trim()) {
                        content = script.textContent;
                    }
                    // Method 2: Try innerHTML if textContent is empty or seems incomplete
                    else if (script.innerHTML && script.innerHTML.trim()) {
                        content = script.innerHTML;
                    }
                    
                    // Method 3: If DOMParser didn't work well, extract directly from raw HTML
                    // This is more reliable for complex scripts, but skip live-reload scripts
                    if (!content || content.length < 10) {
                        // Find all script tags in raw HTML, but exclude live-reload scripts
                        const scriptTagRegex = /<script\s*([^>]*)>([\s\S]*?)<\/script>/gi;
                        const rawScripts = [];
                        let rawMatch;
                        scriptTagRegex.lastIndex = 0;
                        while ((rawMatch = scriptTagRegex.exec(html)) !== null) {
                            const rawAttrs = rawMatch[1] || '';
                            const rawContent = rawMatch[2] || '';
                            
                            // Skip live-reload scripts
                            if (rawContent.includes('Live reload enabled') || 
                                rawContent.includes('live-server') ||
                                rawContent.includes('WebSocket') && rawContent.includes('refreshCSS') ||
                                rawAttrs.includes('livereload') ||
                                rawAttrs.includes('live-server')) {
                                continue;
                            }
                            
                            // Only include inline scripts (no src attribute)
                            if (!rawAttrs.includes('src=')) {
                                rawScripts.push(rawContent);
                            }
                        }
                        
                        // Use the script at the same index (adjusting for skipped live-reload scripts)
                        if (rawScripts[scriptIndex]) {
                            content = rawScripts[scriptIndex];
                        }
                    }
                    
                    // Clean content - preserve structure but remove leading/trailing whitespace
                    content = content ? content.trim() : '';
                    
                    // Final check: skip if content looks like a live-reload script
                    if (content && (
                        content.includes('Live reload enabled') || 
                        content.includes('live-server') ||
                        (content.includes('WebSocket') && content.includes('refreshCSS'))
                    )) {
                        script.remove();
                        return;
                    }
                    
                    // Only add if we have content or src
                    if (script.src || content) {
                        scriptsToExecute.push({
                            src: script.src || null,
                            content: content || null
                        });
                    }
                    
                    // Remove script from doc to prevent double execution
                    script.remove();
                });
                
                // Set HTML content (without scripts)
                mainContent.innerHTML = doc.body.innerHTML;
                
                // Show/hide parallax container based on route
                const parallaxContainer = document.getElementById('parallax-container');
                if (parallaxContainer) {
                    if (this.currentRoute === '/' || this.currentRoute === '/home') {
                        parallaxContainer.style.display = 'block';
                    } else {
                        parallaxContainer.style.display = 'none';
                    }
                }
                
                // Execute scripts sequentially to avoid race conditions
                // Wait a bit to ensure DOM is ready, then execute scripts
                // After scripts are done, reinitialize page
                setTimeout(() => {
                    this.executeScriptsSequentially(scriptsToExecute, 0, () => {
                        // All scripts executed, now reinitialize page
                        this.reinitializePage();
                    });
                }, 50);
            }
        } catch (error) {
            console.error('Error loading page:', error);
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="min-h-screen flex items-center justify-center">
                        <div class="text-center">
                            <h1 class="text-4xl font-bold text-gray-800 mb-4">Pagina niet gevonden</h1>
                            <p class="text-gray-600 mb-6">De gevraagde pagina kon niet worden geladen.</p>
                            <a href="/" class="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                                Terug naar Home
                            </a>
                        </div>
                    </div>
                `;
            }
        }
    }

    reinitializePage() {
        // Re-run data loading if needed (for homepage)
        if ((this.currentRoute === '/' || this.currentRoute === '/home') && typeof window.loadData === 'function') {
            // Reset loading flag to allow reload
            if (window.isLoadingData !== undefined) {
                window.isLoadingData = false;
            }
            // Wait a bit for DOM to be ready
            setTimeout(() => {
                if (window.loadData) {
                    window.loadData();
                }
            }, 100);
        }
        
        // Initialize admin pages directly (they don't use DOMContentLoaded)
        const adminRoutes = {
            '/admin': 'initializeAdmin',
            '/admin/evenementen': 'initializeAdminEvents',
            '/admin/corristories': 'initializeAdminCorristories',
            '/admin/zones': 'initializeAdminZones',
            '/admin/gebruikers': 'initializeAdminUsers',
            '/admin/partners': 'initializeAdminPartners'
        };
        
        const initFunction = adminRoutes[this.currentRoute];
        if (initFunction && typeof window[initFunction] === 'function') {
            // Call after a short delay to ensure DOM is ready
            setTimeout(() => {
                try {
                    window[initFunction]();
                } catch (error) {
                    console.error(`Error initializing ${initFunction}:`, error);
                }
            }, 50);
        }
        
        // Initialize agenda page when loaded via router
        if (this.currentRoute === '/agenda' && typeof window.initializeAgenda === 'function') {
            setTimeout(() => {
                try {
                    window.initializeAgenda();
                } catch (error) {
                    console.error('Error initializing agenda:', error);
                }
            }, 100);
        }
        
        // Reinitialize GSAP animations if needed
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            try {
                ScrollTrigger.refresh();
            } catch (error) {
                console.error('Error refreshing ScrollTrigger:', error);
            }
        }
    }

    updateActiveNav() {
        // Update active nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkRoute = href || '/';
            
            if (linkRoute === this.currentRoute || (this.currentRoute === '/' && linkRoute === '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Also update navigation component if it exists
        if (window.navigation && typeof window.navigation.updateNavOnRouteChange === 'function') {
            window.navigation.updateNavOnRouteChange();
        }
    }

    navigate(path) {
        try {
            if (this.useHashRouting) {
                // Fallback to hash routing if History API not supported
                window.location.hash = path;
            } else {
                // Use History API
                window.history.pushState({}, '', path);
            }
            this.handleRoute();
            // Dispatch custom event for route change
            window.dispatchEvent(new CustomEvent('routechange', { detail: { path } }));
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback: try direct navigation
            window.location.href = path;
        }
    }
}

// Initialize router
window.router = new Router();
