// Database operations module for Corridor website

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

    // Activities
    async getActivities(activityType = null) {
        if (!this.supabase) {
            throw new Error('Supabase client not initialized');
        }

        // Validate and sanitize input to prevent injection
        // Supabase already protects against SQL injection, but we add extra validation
        if (activityType !== null && activityType !== undefined) {
            // Only allow alphanumeric, underscore, and hyphen
            if (!/^[a-zA-Z0-9_-]+$/.test(activityType)) {
                throw new Error('Invalid activityType: only alphanumeric characters, underscore, and hyphen allowed');
            }
            // Limit length
            if (activityType.length > 50) {
                throw new Error('Invalid activityType: maximum length is 50 characters');
            }
        }

        console.log('getActivities called, activityType:', activityType);
        
        try {
            let queryBuilder = this.supabase.from('activities');
            queryBuilder = queryBuilder.select('*, zones(*)');
            queryBuilder = queryBuilder.order('created_at', { ascending: false });
            
            if (activityType) {
                // Supabase .eq() automatically escapes the value - safe from SQL injection
                queryBuilder = queryBuilder.eq('activity_type', activityType);
            }
            
            const { data, error } = await queryBuilder;
            
            if (error) {
                // Log error details for debugging in production
                console.error('Database error in getActivities:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }
            
            return data || [];
        } catch (error) {
            // Log critical errors for production debugging
            console.error('Error in getActivities:', error.message);
            throw error;
        }
    }

    async createActivity(activity) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await this.supabase
            .from('activities')
            .insert([{
                ...activity,
                created_by: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateActivity(id, updates) {
        const { data, error } = await this.supabase
            .from('activities')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteActivity(id) {
        const { error } = await this.supabase
            .from('activities')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }

    // Agenda Items
    async getAgendaItems(zoneId = null) {
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
            .from('agenda_items')
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

    async createAgendaItem(item) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await this.supabase
            .from('agenda_items')
            .insert([{
                ...item,
                created_by: user.id
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateAgendaItem(id, updates) {
        const { data, error } = await this.supabase
            .from('agenda_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteAgendaItem(id) {
        const { error } = await this.supabase
            .from('agenda_items')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
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
        const { data, error } = await this.supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async deleteUser(userId) {
        const { error } = await this.supabase
            .from('users')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
    }

    // Partners are now hardcoded in HTML, no database method needed
}

// Initialize database manager
window.dbManager = new DatabaseManager();

