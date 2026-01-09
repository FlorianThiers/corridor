// Database operations module for Corridor website

// Prevent re-execution if already loaded
if (typeof window.DatabaseManager !== 'undefined') {
    // Already loaded, skip
} else {
class DatabaseManager {
    constructor() {
        // Wait for supabase client to be available
        this.supabase = null;
        this.init();
    }

    init() {
        if (window.supabaseClient) {
            this.supabase = window.supabaseClient;
            
            // Verify Supabase client is properly initialized
            if (!this.supabase.from) {
                console.error('❌ Supabase client does not have .from() method');
            }
        } else {
            // Retry initialization after a short delay
            setTimeout(() => this.init(), 100);
        }
    }

    // Zones
    async getZones() {
        const { data, error } = await this.supabase
            .from('zones')
            .select('*')
            .order('zone_number', { ascending: true });
        
        if (error) throw error;
        return data;
    }

    async getZone(zoneId) {
        // Validate zoneId to prevent injection (Supabase already protects, but extra validation)
        if (!zoneId) {
            throw new Error('zoneId is required');
        }
        if (typeof zoneId !== 'string' && typeof zoneId !== 'number') {
            throw new Error('Invalid zoneId: must be a string or number');
        }

        // Supabase .eq() automatically escapes the value - safe from SQL injection
        const { data, error } = await this.supabase
            .from('zones')
            .select('*')
            .eq('id', zoneId)
            .single();
        
        if (error) throw error;
        return data;
    }

    // Evenementen (Large Events)
    async getEvenementen(zoneId = null) {
        // Validate zoneId if provided
        if (zoneId !== null && zoneId !== undefined) {
            // zoneId should be a UUID or integer
            if (typeof zoneId !== 'string' && typeof zoneId !== 'number') {
                throw new Error('Invalid zoneId: must be a string or number');
            }
            // If string, validate UUID format or numeric string
            if (typeof zoneId === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(zoneId) && !/^\d+$/.test(zoneId)) {
                throw new Error('Invalid zoneId format');
            }
        }

        let query = this.supabase
            .from('evenementen')
            .select('*, zones(*)')
            .order('start_datetime', { ascending: true });
        
        if (zoneId) {
            // Supabase .eq() automatically escapes the value - safe from SQL injection
            query = query.eq('zone_id', zoneId);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async createEvenement(evenement) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await this.supabase
            .from('evenementen')
            .insert([{
                ...evenement,
                created_by: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateEvenement(id, updates) {
        const { data, error } = await this.supabase
            .from('evenementen')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteEvenement(id) {
        const { error } = await this.supabase
            .from('evenementen')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // Legacy method name for backwards compatibility (deprecated)
    async getAgendaItems(zoneId = null) {
        return this.getEvenementen(zoneId);
    }

    async createAgendaItem(item) {
        return this.createEvenement(item);
    }

    async updateAgendaItem(id, updates) {
        return this.updateEvenement(id, updates);
    }

    async deleteAgendaItem(id) {
        return this.deleteEvenement(id);
    }

    // Corristories
    async getCorristories() {
        // Only select zones, not users to avoid RLS recursion
        // author_name is already stored in corristories table
        const { data, error } = await this.supabase
            .from('corristories')
            .select('*, zones(*)')
            .eq('is_published', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async createCorristory(story) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await this.supabase
            .from('corristories')
            .insert([{
                ...story,
                author_id: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateCorristory(id, updates) {
        const { data, error } = await this.supabase
            .from('corristories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteCorristory(id) {
        const { error } = await this.supabase
            .from('corristories')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // Users
    async getUsers() {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }

    async getUser(userId) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateUser(userId, updates) {
        // Check if user has admin role before updating
        const { data: { user: currentUser } } = await this.supabase.auth.getUser();
        if (!currentUser) throw new Error('Not authenticated');
        
        // Get current user's role from users table
        const { data: currentUserData } = await this.supabase
            .from('users')
            .select('role')
            .eq('id', currentUser.id)
            .maybeSingle();
        
        if (!currentUserData || currentUserData.role !== 'admin') {
            throw new Error('Only admins can update users');
        }
        
        // First, try update without select to avoid "Cannot coerce" errors
        // This approach avoids issues with database functions/triggers that might return wrong format
        const { error: updateError } = await this.supabase
            .from('users')
            .update(updates)
            .eq('id', userId);
        
        if (updateError) {
            // Check for specific error types
            if (updateError.code === '42501' || updateError.message.includes('row-level security')) {
                throw new Error('Geen toestemming om gebruiker bij te werken. Controleer de RLS policies in Supabase.');
            }
            
            // Check for check constraint violations (e.g., invalid role)
            if (updateError.code === '23514' || updateError.message.includes('check constraint') || updateError.message.includes('violates check constraint')) {
                if (updateError.message.includes('role')) {
                    throw new Error('De geselecteerde rol is niet geldig. Toegestane rollen: user, admin, programmer, bestuurder.');
                }
                throw new Error(`Database constraint violation: ${updateError.message}`);
            }
            
            // If update failed, throw the error
            throw new Error(`Fout bij bijwerken gebruiker: ${updateError.message}`);
        }
        
        // Update succeeded (no error), now try to fetch the updated user
        // But if RLS blocks it, that's okay - the update was successful
        const { data: updatedUser, error: fetchError } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        
        // If we can fetch the user, return it
        if (updatedUser && !fetchError) {
            return updatedUser;
        }
        
        // If we can't fetch (likely due to RLS blocking read access after role change),
        // but update succeeded (no updateError), return a minimal success object
        // The UI will reload users list which should work since admin can read all users
        if (fetchError && (fetchError.code === '42501' || fetchError.message.includes('row-level security'))) {
            // RLS blocked reading, but update succeeded - return success
            return {
                id: userId,
                ...updates
            };
        }
        
        // Some other fetch error occurred, but update likely succeeded
        // Log warning but don't fail - update was successful
        console.warn('Update succeeded but could not fetch updated user:', fetchError);
        return {
            id: userId,
            ...updates
        };
    }

    async deleteUser(userId) {
        const { error } = await this.supabase
            .from('users')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
    }

    // Partners
    async getPartners() {
        const { data, error } = await this.supabase
            .from('partners')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        
        // Load zones separately if zone_id column exists and has values
        if (data && data.length > 0) {
            // Check if any partner has zone_id (column might not exist)
            const zoneIds = [...new Set(data.map(p => p.zone_id).filter(Boolean))];
            if (zoneIds.length > 0) {
                const { data: zones } = await this.supabase
                    .from('zones')
                    .select('*')
                    .in('id', zoneIds);
                
                if (zones) {
                    const zonesMap = new Map(zones.map(z => [z.id, z]));
                    data.forEach(partner => {
                        if (partner.zone_id && zonesMap.has(partner.zone_id)) {
                            partner.zones = zonesMap.get(partner.zone_id);
                        }
                    });
                }
            }
        }
        
        return data || [];
    }

    async getPartner(partnerId) {
        if (!partnerId) {
            throw new Error('partnerId is required');
        }
        if (typeof partnerId !== 'string' && typeof partnerId !== 'number') {
            throw new Error('Invalid partnerId: must be a string or number');
        }

        const { data, error } = await this.supabase
            .from('partners')
            .select('*')
            .eq('id', partnerId)
            .single();
        
        if (error) throw error;
        
        // Load zone separately if zone_id column exists and has a value
        if (data && data.zone_id) {
            const { data: zone } = await this.supabase
                .from('zones')
                .select('*')
                .eq('id', data.zone_id)
                .single();
            
            if (zone) {
                data.zones = zone;
            }
        }
        
        return data;
    }

    async createPartner(partner) {
        // Check if user is authenticated
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        // Note: partners table doesn't have created_by column, so we don't include it
        const { data, error } = await this.supabase
            .from('partners')
            .insert([partner])
            .select('*')
            .single();
        
        if (error) {
            // Provide more helpful error message for RLS policy errors
            if (error.code === '42501' || error.message.includes('row-level security')) {
                throw new Error('Geen toestemming om partners toe te voegen. Controleer de RLS policies in Supabase.');
            }
            throw error;
        }
        
        // Load zone separately if zone_id column exists and has a value
        if (data && data.zone_id) {
            const { data: zone } = await this.supabase
                .from('zones')
                .select('*')
                .eq('id', data.zone_id)
                .single();
            
            if (zone) {
                data.zones = zone;
            }
        }
        
        return data;
    }

    async updatePartner(id, updates) {
        const { data, error } = await this.supabase
            .from('partners')
            .update(updates)
            .eq('id', id)
            .select('*')
            .single();
        
        if (error) throw error;
        
        // Load zone separately if zone_id column exists and has a value
        if (data && data.zone_id) {
            const { data: zone } = await this.supabase
                .from('zones')
                .select('*')
                .eq('id', data.zone_id)
                .single();
            
            if (zone) {
                data.zones = zone;
            }
        }
        
        return data;
    }

    async deletePartner(id) {
        const { error } = await this.supabase
            .from('partners')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // Pages
    async getPages() {
        const { data, error } = await this.supabase
            .from('pages')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data || [];
    }

    async getPage(route) {
        const { data, error } = await this.supabase
            .from('pages')
            .select('*')
            .eq('route', route)
            .single();
        
        if (error) {
            // Return null if page not found (fallback to HTML)
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createPage(page) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await this.supabase
            .from('pages')
            .insert([{
                ...page,
                created_by: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updatePage(id, updates) {
        const { data, error } = await this.supabase
            .from('pages')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deletePage(id) {
        const { error } = await this.supabase
            .from('pages')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // Sections
    async getSections(pageId) {
        const { data, error } = await this.supabase
            .from('sections')
            .select('*')
            .eq('page_id', pageId)
            .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data || [];
    }

    async getSectionsByRoute(route) {
        // First get the page by route
        const page = await this.getPage(route);
        if (!page) return [];
        
        return await this.getSections(page.id);
    }

    async createSection(section) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await this.supabase
            .from('sections')
            .insert([{
                ...section,
                created_by: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateSection(id, updates) {
        const { data, error } = await this.supabase
            .from('sections')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteSection(id) {
        const { error } = await this.supabase
            .from('sections')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // Navigation Links
    async getNavigationLinks() {
        const { data, error } = await this.supabase
            .from('navigation_links')
            .select('*')
            .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data || [];
    }

    async createNavigationLink(link) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await this.supabase
            .from('navigation_links')
            .insert([{
                ...link,
                created_by: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateNavigationLink(id, updates) {
        const { data, error } = await this.supabase
            .from('navigation_links')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteNavigationLink(id) {
        const { error } = await this.supabase
            .from('navigation_links')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
}

// Initialize database manager
window.dbManager = new DatabaseManager();
window.DatabaseManager = DatabaseManager; // Store for guard check
}

