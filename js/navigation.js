// Navigation Component - Hamburger Sidebar

class Navigation {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        // Only render if not already rendered
        if (!document.getElementById('hamburger-btn')) {
            this.render();
        }
        this.attachEventListeners();
    }

    render() {
        const navHTML = `
            <!-- Sidebar Overlay -->
            <div id="sidebar-overlay" class="sidebar-overlay"></div>

            <!-- Hamburger Button -->
            <button id="hamburger-btn" class="hamburger-btn fixed top-6 left-6 z-[10001] w-12 h-12 bg-gray-600/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-gray-500/80 hover:scale-110 shadow-lg transition-all cursor-pointer" aria-label="Menu" type="button">
                <svg id="hamburger-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>

            <!-- Sidebar -->
            <nav id="sidebar" class="sidebar">
                <div class="sidebar-content">
                    <!-- Logo -->
                    <div class="sidebar-header">
                        <div class="flex items-center space-x-3 mb-6">
                            <img src="/public/LogoCorridor-removebg-preview.png" alt="Corridor Logo" class="h-10 w-10">
                            <span class="text-xl font-bold text-gray-800">CORRIDOR</span>
                        </div>
                    </div>

                    <!-- Auth Section (Login/Profile) - Above navigation links -->
                    <div class="sidebar-auth-top mb-4">
                        <button id="sidebar-login-btn" class="sidebar-link w-full bg-pink-500 text-white hover:bg-pink-600 hidden mb-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                            </svg>
                            <span>Inloggen</span>
                        </button>
                        <button id="sidebar-profile-btn" class="sidebar-link hidden" onclick="if(window.router){window.router.navigate('/profiel')}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span>Profiel</span>
                        </button>
                    </div>

                    <!-- Admin Links (only visible for admins) - Moved to top -->
                    <div id="admin-nav-section" class="hidden mb-4">
                        <!-- Collapse Toggle for Admin Nav -->
                        <div class="mb-2">
                            <button id="toggle-admin-nav" class="sidebar-link w-full text-left text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100" onclick="window.navigation?.toggleAdminNav()">
                                <svg id="admin-nav-collapse-icon" class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                                <span>Admin</span>
                            </button>
                        </div>
                        
                        <div id="admin-nav-links">
                            <a href="/beheer-evenementen" class="nav-link sidebar-link admin-nav-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                <span>Evenementen</span>
                            </a>
                            <a href="/beheer-corristories" class="nav-link sidebar-link admin-nav-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                <span>Corristories</span>
                            </a>
                            <a href="/beheer-zones" class="nav-link sidebar-link admin-nav-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                <span>Zones</span>
                            </a>
                            <a href="/beheer-gebruikers" class="nav-link sidebar-link admin-nav-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                                <span>Gebruikers</span>
                            </a>
                            <a href="/beheer-partners" class="nav-link sidebar-link admin-nav-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                <span>Partners</span>
                            </a>
                            <a href="/beheer-animatie" class="nav-link sidebar-link admin-nav-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                                <span>Animatie</span>
                            </a>
                        </div>
                    </div>

                    <!-- Navigation Links -->
                    <div id="main-nav-section" class="sidebar-nav">
                        <div id="main-nav-links">
                            <a href="/" class="nav-link sidebar-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                </svg>
                                <span>Home</span>
                            </a>
                            <a href="/agenda" class="nav-link sidebar-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                                </svg>
                                <span>Agenda</span>
                            </a>
                            <a href="/zones" class="nav-link sidebar-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                <span>Zones</span>
                            </a>
                            <a href="/evenementen" class="nav-link sidebar-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span>Evenementen</span>
                            </a>
                            <a href="/corristories" class="nav-link sidebar-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                <span>Corristories</span>
                            </a>
                            <a href="/partners" class="nav-link sidebar-link">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                <span>Partners</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        // Insert navigation at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    attachEventListeners() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');

        // Toggle sidebar
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSidebar();
            });
        }

        // Close sidebar when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Don't auto-close sidebar when clicking nav links - let user close manually

        // Close sidebar on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSidebar();
            }
        });

        // Prevent sidebar from closing when clicking inside
        if (sidebar) {
            sidebar.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Update auth buttons
        this.updateAuthButtons();

        // Also update when authManager becomes available (if not ready yet)
        if (!window.authManager) {
            const checkAuthManager = setInterval(() => {
                if (window.authManager) {
                    clearInterval(checkAuthManager);
                    this.updateAuthButtons();
                }
            }, 100);

            // Stop checking after 5 seconds
            setTimeout(() => clearInterval(checkAuthManager), 5000);
        }
    }

    toggleSidebar() {
        this.isOpen = !this.isOpen;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');
        const body = document.body;

        if (this.isOpen) {
            sidebar?.classList.add('open');
            overlay?.classList.add('active');
            hamburgerIcon?.classList.add('hidden');
            closeIcon?.classList.remove('hidden');
            body.style.overflow = 'hidden';
        } else {
            sidebar?.classList.remove('open');
            overlay?.classList.remove('active');
            hamburgerIcon?.classList.remove('hidden');
            closeIcon?.classList.add('hidden');
            body.style.overflow = '';
        }
    }

    openSidebar() {
        if (!this.isOpen) {
            this.toggleSidebar();
        }
    }

    closeSidebar() {
        if (this.isOpen) {
            this.toggleSidebar();
        }
    }

    updateAuthButtons() {
        const isLoggedIn = window.authManager && window.authManager.isAuthenticated();
        const isAdmin = window.authManager && window.authManager.isAdmin();

        // Sidebar buttons
        const sidebarLoginBtn = document.getElementById('sidebar-login-btn');
        const sidebarProfileBtn = document.getElementById('sidebar-profile-btn');
        const adminNavSection = document.getElementById('admin-nav-section');

        // Update sidebar buttons
        if (sidebarLoginBtn) sidebarLoginBtn.classList.toggle('hidden', isLoggedIn);
        if (sidebarProfileBtn) sidebarProfileBtn.classList.toggle('hidden', !isLoggedIn);

        // Show/hide admin navigation section
        if (adminNavSection) {
            adminNavSection.classList.toggle('hidden', !isAdmin);
        }

        // Attach login handler
        if (sidebarLoginBtn) {
            sidebarLoginBtn.onclick = () => {
                this.closeSidebar();
                setTimeout(() => {
                    const loginModal = document.getElementById('login-modal');
                    if (loginModal) loginModal.classList.add('active');
                }, 300);
            };
        }
    }

    // Toggle admin navigation
    toggleAdminNav() {
        const adminNavLinks = document.getElementById('admin-nav-links');
        const collapseIcon = document.getElementById('admin-nav-collapse-icon');
        
        if (adminNavLinks && collapseIcon) {
            const isCollapsed = adminNavLinks.classList.contains('hidden');
            
            if (isCollapsed) {
                adminNavLinks.classList.remove('hidden');
                collapseIcon.style.transform = 'rotate(0deg)';
            } else {
                adminNavLinks.classList.add('hidden');
                collapseIcon.style.transform = 'rotate(-90deg)';
            }
        }
    }

    // Update navigation when route changes
    updateNavOnRouteChange() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentRoute = window.router ? window.router.currentRoute : window.location.pathname || '/';

        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '/';
            const linkRoute = href;

            if (linkRoute === currentRoute || (currentRoute === '/' && linkRoute === '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.navigation = new Navigation();
    });
} else {
    window.navigation = new Navigation();
}
