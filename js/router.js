// Simple Router for Corridor Website
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
            '/activiteiten': 'pages/activiteiten.html',
            '/corrigirls': 'pages/corrigirls.html',
            '/evenementen': 'pages/evenementen.html',
            '/agenda': 'pages/agenda.html',
            '/corristories': 'pages/corristories.html',
            '/partners': 'pages/partners.html',
            '/profiel': 'pages/profiel.html',
            '/admin': 'pages/admin.html',
            '/admin/activiteiten': 'pages/admin-activiteiten.html',
            '/admin/evenementen': 'pages/admin-evenementen.html',
            '/admin/corristories': 'pages/admin-corristories.html',
            '/admin/zones': 'pages/admin-zones.html',
            '/admin/gebruikers': 'pages/admin-gebruikers.html'
        };

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial route
        this.handleRoute();
    }

    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const route = hash.split('?')[0]; // Remove query params
        
        // Protect admin routes - only allow admins and programmers
        if (route.startsWith('/admin')) {
            if (!window.authManager || !window.authManager.isAdmin()) {
                // Redirect to home if not admin/programmer
                window.location.hash = '/';
                return;
            }
        }
        
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
                
                // Get all script tags
                const scripts = doc.querySelectorAll('script');
                const scriptsToExecute = [];
                
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    scriptsToExecute.push(newScript);
                    script.remove(); // Remove from doc
                });
                
                // Set HTML content (without scripts)
                mainContent.innerHTML = doc.body.innerHTML;
                
                // Execute scripts after a short delay
                setTimeout(() => {
                    scriptsToExecute.forEach(script => {
                        document.body.appendChild(script);
                    });
                }, 10);
                
                // Show/hide parallax container based on route
                const parallaxContainer = document.getElementById('parallax-container');
                if (parallaxContainer) {
                    if (this.currentRoute === '/' || this.currentRoute === '/home') {
                        parallaxContainer.style.display = 'block';
                    } else {
                        parallaxContainer.style.display = 'none';
                    }
                }
                
                // Reinitialize scripts after page load
                this.reinitializePage();
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
                            <a href="#/" class="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
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
                window.loadData();
            }, 100);
        }
        
        // Initialize admin pages directly (they don't use DOMContentLoaded)
        const adminRoutes = {
            '/admin/activiteiten': 'initializeAdminActivities',
            '/admin/evenementen': 'initializeAdminEvents',
            '/admin/corristories': 'initializeAdminCorristories',
            '/admin/zones': 'initializeAdminZones',
            '/admin/gebruikers': 'initializeAdminUsers'
        };
        
        const initFunction = adminRoutes[this.currentRoute];
        if (initFunction && typeof window[initFunction] === 'function') {
            // Call after a short delay to ensure DOM is ready
            setTimeout(() => {
                window[initFunction]();
            }, 50);
        }
        
        // Reinitialize GSAP animations if needed
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }

    updateActiveNav() {
        // Update active nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkRoute = href.replace('#', '') || '/';
            
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
        window.location.hash = path;
    }
}

// Initialize router
window.router = new Router();

