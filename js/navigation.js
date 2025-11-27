// Navigation Component - Hamburger Sidebar
class Navigation {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const navHTML = `
            <!-- Sidebar Overlay -->
            <div id="sidebar-overlay" class="sidebar-overlay"></div>
            
            <!-- Hamburger Button -->
            <button id="hamburger-btn" class="hamburger-btn fixed top-6 left-6 z-[10001] w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white hover:scale-110 shadow-lg transition-all cursor-pointer" aria-label="Menu" type="button">
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
                            <img src="./public/LogoCorridor-removebg-preview.png" alt="Corridor Logo" class="h-10 w-10">
                            <span class="text-xl font-bold text-gray-800">CORRIDOR</span>
                        </div>
                    </div>

                    <!-- Navigation Links -->
                    <div class="sidebar-nav">
                        <a href="#/" class="nav-link sidebar-link">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            <span>Home</span>
                        </a>
                        <a href="#/activiteiten" class="nav-link sidebar-link">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            <span>Activiteiten</span>
                        </a>
                        <a href="#/corrigirls" class="nav-link sidebar-link">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                            <span>Corrigirls</span>
                        </a>
                        <a href="#/evenementen" class="nav-link sidebar-link">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>Evenementen</span>
                        </a>
                        <a href="#/agenda" class="nav-link sidebar-link">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                            </svg>
                            <span>Agenda</span>
                        </a>
                        <a href="#/corristories" class="nav-link sidebar-link">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            <span>Corristories</span>
                        </a>
                        <a href="#/partners" class="nav-link sidebar-link">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <span>Partners</span>
                        </a>
                    </div>

                    <!-- Auth Section -->
                    <div class="sidebar-auth">
                        <div class="border-t border-gray-200 pt-4 mt-4">
                            <button id="sidebar-login-btn" class="sidebar-link w-full bg-pink-500 text-white hover:bg-pink-600 hidden">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                </svg>
                                <span>Inloggen</span>
                            </button>
                            <button id="sidebar-profile-btn" class="sidebar-link hidden" onclick="window.location.hash='#/profiel'">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <span>Profiel</span>
                            </button>
                            <button id="sidebar-admin-btn" class="sidebar-link hidden" onclick="window.location.hash='#/admin'">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span>Admin</span>
                            </button>
                            <button id="sidebar-logout-btn" class="sidebar-link text-red-600 hover:bg-red-50 hidden">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                <span>Uitloggen</span>
                            </button>
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

        // Close sidebar when clicking on nav links
        const navLinks = document.querySelectorAll('.sidebar-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.closeSidebar(), 300);
            });
        });

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

        const loginBtn = document.getElementById('sidebar-login-btn');
        const profileBtn = document.getElementById('sidebar-profile-btn');
        const adminBtn = document.getElementById('sidebar-admin-btn');
        const logoutBtn = document.getElementById('sidebar-logout-btn');

        if (loginBtn) loginBtn.classList.toggle('hidden', isLoggedIn);
        if (profileBtn) profileBtn.classList.toggle('hidden', !isLoggedIn);
        if (adminBtn) adminBtn.classList.toggle('hidden', !isAdmin);
        if (logoutBtn) logoutBtn.classList.toggle('hidden', !isLoggedIn);

        // Attach login handler
        if (loginBtn) {
            loginBtn.onclick = () => {
                this.closeSidebar();
                setTimeout(() => {
                    const loginModal = document.getElementById('login-modal');
                    if (loginModal) loginModal.classList.add('active');
                }, 300);
            };
        }

        // Attach logout handler
        if (logoutBtn) {
            logoutBtn.onclick = async () => {
                this.closeSidebar();
                if (typeof handleSignOut === 'function') {
                    await handleSignOut();
                }
            };
        }
    }

    // Update navigation when route changes
    updateNavOnRouteChange() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentRoute = window.router ? window.router.currentRoute : window.location.hash.slice(1) || '/';
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkRoute = href.replace('#', '') || '/';
            
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
