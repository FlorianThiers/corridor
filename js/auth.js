// Authentication module for Corridor website

// Prevent re-execution if already loaded
if (typeof window.AuthManager !== 'undefined') {
    // Already loaded, skip
} else {
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.role = 'user';
        this.init();
    }

    async init() {
        if (!window.supabaseClient) {
            console.error('Supabase client not initialized');
            return;
        }

        // Check for existing session - wrap in try/catch to prevent errors
        try {
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            if (error) {
                // Silent fail for unauthenticated users (normal behavior)
            } else if (session) {
                await this.loadUserProfile(session.user.id);
            }
        } catch (error) {
            // Silent fail for auth errors
        }

        // Listen for auth state changes
        window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await this.loadUserProfile(session.user.id);
                this.updateUI();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.role = 'user';
                this.updateUI();
            }
        });

        this.updateUI();
    }

    async loadUserProfile(userId) {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (data && !error) {
            this.currentUser = data;
            this.role = data.role || 'user';
        }
    }

    async signUp(email, password, fullName) {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) throw error;
        return data;
    }

    async signIn(email, password) {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        
        if (data.user) {
            await this.loadUserProfile(data.user.id);
            this.updateUI();
        }
        
        return data;
    }

    async signOut() {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        
        this.currentUser = null;
        this.role = 'user';
        this.updateUI();
    }
    
    isAdmin() {
        // Check if user has admin role
        return this.role === 'admin';
    }
    
    
    hasRole(requiredRole) {
        return this.role === requiredRole;
    }

    updateUI() {
        // Auth buttons are now only in the hamburger menu
        // The menu will update itself via the updateMenuAuthButtons function
        const loginModal = document.getElementById('login-modal');
        
        // Hide login modal if user is logged in and modal is open
        if (this.currentUser && loginModal) {
            loginModal.classList.remove('active');
        }
        
        // Trigger menu update if hamburger menu is initialized
        if (window.updateMenuAuthButtons && typeof window.updateMenuAuthButtons === 'function') {
            window.updateMenuAuthButtons();
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager
window.authManager = new AuthManager();
window.AuthManager = AuthManager; // Store for guard check
}

