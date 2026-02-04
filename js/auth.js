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
        try {
            const { data, error } = await window.supabaseClient
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error loading user profile:', error);
                // Don't clear current user on error, might be temporary
                return;
            }

            if (data) {
                this.currentUser = data;
                this.role = data.role || 'user';
                console.log('User profile loaded:', { id: data.id, email: data.email, role: this.role });
            } else {
                console.warn('No user data returned for userId:', userId);
            }
        } catch (error) {
            console.error('Exception loading user profile:', error);
            // Don't clear current user on exception
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
            // Wait a bit for session to be fully established
            await new Promise(resolve => setTimeout(resolve, 100));
            await this.loadUserProfile(data.user.id);
            this.updateUI();
            
            // Verify profile was loaded
            if (!this.currentUser) {
                console.warn('User profile not loaded after sign in, retrying...');
                await new Promise(resolve => setTimeout(resolve, 500));
                await this.loadUserProfile(data.user.id);
            }
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
        // Check if user has admin or programmer role (both have admin privileges)
        return this.role === 'admin' || this.role === 'programmer';
    }
    
    
    hasRole(requiredRole) {
        return this.role === requiredRole;
    }
    
    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        return roles.includes(this.role);
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
        if (window.navigation && typeof window.navigation.updateAuthButtons === 'function') {
            window.navigation.updateAuthButtons();
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

