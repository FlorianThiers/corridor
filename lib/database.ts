import type { SupabaseClient } from '@supabase/supabase-js'
import type { Zone, Evenement, Corristory, User, Partner, Page, Section, NavigationLink } from '@/types'

// Server-side database operations
export async function getZones(supabase: SupabaseClient): Promise<Zone[]> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .order('zone_number', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getZone(supabase: SupabaseClient, zoneId: string | number): Promise<Zone> {
  if (!zoneId) {
    throw new Error('zoneId is required')
  }
  if (typeof zoneId !== 'string' && typeof zoneId !== 'number') {
    throw new Error('Invalid zoneId: must be a string or number')
  }

  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('id', zoneId)
    .single()
  
  if (error) throw error
  return data
}

export async function createZone(supabase: SupabaseClient, zone: Partial<Zone>): Promise<Zone> {
  const { data, error } = await supabase
    .from('zones')
    .insert([zone])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateZone(supabase: SupabaseClient, id: string, updates: Partial<Zone>): Promise<Zone> {
  const { data, error } = await supabase
    .from('zones')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteZone(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('zones')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getEvenementen(supabase: SupabaseClient, zoneId?: string | null): Promise<Evenement[]> {
  if (zoneId !== null && zoneId !== undefined) {
    if (typeof zoneId !== 'string' && typeof zoneId !== 'number') {
      throw new Error('Invalid zoneId: must be a string or number')
    }
    if (typeof zoneId === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(zoneId) && !/^\d+$/.test(zoneId)) {
      throw new Error('Invalid zoneId format')
    }
  }

  let query = supabase
    .from('evenementen')
    .select('*, zones(*)')
    .order('start_datetime', { ascending: true })
  
  if (zoneId) {
    query = query.eq('zone_id', zoneId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createEvenement(supabase: SupabaseClient, evenement: Partial<Evenement>): Promise<Evenement> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('evenementen')
    .insert([{
      ...evenement,
      created_by: user.id
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateEvenement(supabase: SupabaseClient, id: string, updates: Partial<Evenement>): Promise<Evenement> {
  const { data, error } = await supabase
    .from('evenementen')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteEvenement(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('evenementen')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Legacy method names for backwards compatibility
export const getAgendaItems = getEvenementen
export const createAgendaItem = createEvenement
export const updateAgendaItem = updateEvenement
export const deleteAgendaItem = deleteEvenement

export async function getCorristories(supabase: SupabaseClient): Promise<Corristory[]> {
  const { data, error } = await supabase
    .from('corristories')
    .select('*, zones(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createCorristory(supabase: SupabaseClient, story: Partial<Corristory>): Promise<Corristory> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('corristories')
    .insert([{
      ...story,
      author_id: user.id
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCorristory(supabase: SupabaseClient, id: string, updates: Partial<Corristory>): Promise<Corristory> {
  const { data, error } = await supabase
    .from('corristories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCorristory(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('corristories')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getUsers(supabase: SupabaseClient): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getUser(supabase: SupabaseClient, userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUser(supabase: SupabaseClient, userId: string, updates: Partial<User>): Promise<User> {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')
  
  const { data: currentUserData } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .maybeSingle()
  
  if (!currentUserData || currentUserData.role !== 'admin') {
    throw new Error('Only admins can update users')
  }
  
  const { error: updateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
  
  if (updateError) {
    if (updateError.code === '42501' || updateError.message.includes('row-level security')) {
      throw new Error('Geen toestemming om gebruiker bij te werken. Controleer de RLS policies in Supabase.')
    }
    
    if (updateError.code === '23514' || updateError.message.includes('check constraint') || updateError.message.includes('violates check constraint')) {
      if (updateError.message.includes('role')) {
        throw new Error('De geselecteerde rol is niet geldig. Toegestane rollen: user, admin, programmer, bestuurder.')
      }
      throw new Error(`Database constraint violation: ${updateError.message}`)
    }
    
    throw new Error(`Fout bij bijwerken gebruiker: ${updateError.message}`)
  }
  
  // Wait a tiny bit to ensure database consistency
  await new Promise(resolve => setTimeout(resolve, 50))
  
  const { data: updatedUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  
  if (updatedUser && !fetchError) {
    console.log('Successfully fetched updated user from database:', updatedUser)
    return updatedUser
  }
  
  if (fetchError && (fetchError.code === '42501' || fetchError.message.includes('row-level security'))) {
    console.warn('RLS error fetching updated user, returning constructed user:', fetchError)
    return {
      id: userId,
      ...updates
    } as User
  }
  
  console.warn('Update succeeded but could not fetch updated user:', fetchError)
  // Return constructed user with updates
  const constructedUser = {
    id: userId,
    ...updates
  } as User
  console.log('Returning constructed user:', constructedUser)
  return constructedUser
}

export async function deleteUser(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
  
  if (error) throw error
}

export async function getPartners(supabase: SupabaseClient): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  
  if (data && data.length > 0) {
    const zoneIds = [...new Set(data.map(p => p.zone_id).filter(Boolean))]
    if (zoneIds.length > 0) {
      const { data: zones } = await supabase
        .from('zones')
        .select('*')
        .in('id', zoneIds)
      
      if (zones) {
        const zonesMap = new Map(zones.map(z => [z.id, z]))
        data.forEach(partner => {
          if (partner.zone_id && zonesMap.has(partner.zone_id)) {
            partner.zones = zonesMap.get(partner.zone_id)
          }
        })
      }
    }
  }
  
  return data || []
}

export async function getPartner(supabase: SupabaseClient, partnerId: string | number): Promise<Partner> {
  if (!partnerId) {
    throw new Error('partnerId is required')
  }
  if (typeof partnerId !== 'string' && typeof partnerId !== 'number') {
    throw new Error('Invalid partnerId: must be a string or number')
  }

  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', partnerId)
    .single()
  
  if (error) throw error
  
  if (data && data.zone_id) {
    const { data: zone } = await supabase
      .from('zones')
      .select('*')
      .eq('id', data.zone_id)
      .single()
    
    if (zone) {
      data.zones = zone
    }
  }
  
  return data
}

export async function createPartner(supabase: SupabaseClient, partner: Partial<Partner>): Promise<Partner> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('partners')
    .insert([partner])
    .select('*')
    .single()
  
  if (error) {
    if (error.code === '42501' || error.message.includes('row-level security')) {
      throw new Error('Geen toestemming om partners toe te voegen. Controleer de RLS policies in Supabase.')
    }
    throw error
  }
  
  if (data && data.zone_id) {
    const { data: zone } = await supabase
      .from('zones')
      .select('*')
      .eq('id', data.zone_id)
      .single()
    
    if (zone) {
      data.zones = zone
    }
  }
  
  return data
}

export async function updatePartner(supabase: SupabaseClient, id: string, updates: Partial<Partner>): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()
  
  if (error) throw error
  
  if (data && data.zone_id) {
    const { data: zone } = await supabase
      .from('zones')
      .select('*')
      .eq('id', data.zone_id)
      .single()
    
    if (zone) {
      data.zones = zone
    }
  }
  
  return data
}

export async function deletePartner(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getPages(supabase: SupabaseClient): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getPage(supabase: SupabaseClient, route: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('route', route)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createPage(supabase: SupabaseClient, page: Partial<Page>): Promise<Page> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('pages')
    .insert([{
      ...page,
      created_by: user.id
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePage(supabase: SupabaseClient, id: string, updates: Partial<Page>): Promise<Page> {
  const { data, error } = await supabase
    .from('pages')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deletePage(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getSections(supabase: SupabaseClient, pageId: string): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', pageId)
    .order('order_index', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getSectionsByRoute(supabase: SupabaseClient, route: string): Promise<Section[]> {
  const page = await getPage(supabase, route)
  if (!page) return []
  return await getSections(supabase, page.id)
}

export async function createSection(supabase: SupabaseClient, section: Partial<Section>): Promise<Section> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('sections')
    .insert([{
      ...section,
      created_by: user.id
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateSection(supabase: SupabaseClient, id: string, updates: Partial<Section>): Promise<Section> {
  const { data, error } = await supabase
    .from('sections')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteSection(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getNavigationLinks(supabase: SupabaseClient): Promise<NavigationLink[]> {
  const { data, error } = await supabase
    .from('navigation_links')
    .select('*')
    .order('order_index', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createNavigationLink(supabase: SupabaseClient, link: Partial<NavigationLink>): Promise<NavigationLink> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('navigation_links')
    .insert([{
      ...link,
      created_by: user.id
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateNavigationLink(supabase: SupabaseClient, id: string, updates: Partial<NavigationLink>): Promise<NavigationLink> {
  const { data, error } = await supabase
    .from('navigation_links')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteNavigationLink(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('navigation_links')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
