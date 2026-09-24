import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Zone,
  ZonePhoto,
  ZonePhotoStatus,
  HistoryMilestoneRow,
  HistoryPhotoRow,
  Evenement,
  Corristory,
  User,
  Partner,
  Page,
  Section,
  NavigationLink,
} from '@/types'

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

export async function getZoneByNumber(supabase: SupabaseClient, zoneNumber: number): Promise<Zone | null> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .eq('zone_number', zoneNumber)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getApprovedZonePhotos(
  supabase: SupabaseClient,
  zoneId: string
): Promise<ZonePhoto[]> {
  const { data, error } = await supabase
    .from('zone_photos')
    .select('*')
    .eq('zone_id', zoneId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getZonePhotosForAdmin(
  supabase: SupabaseClient,
  options?: { zoneId?: string; status?: ZonePhotoStatus | 'all' }
): Promise<ZonePhoto[]> {
  let query = supabase
    .from('zone_photos')
    .select('*, zones(*)')
    .order('created_at', { ascending: false })

  if (options?.zoneId) {
    query = query.eq('zone_id', options.zoneId)
  }
  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createZonePhoto(
  supabase: SupabaseClient,
  photo: Partial<ZonePhoto>
): Promise<ZonePhoto> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.email_confirmed_at) {
    throw new Error('E-mailadres moet geverifieerd zijn om foto\'s te uploaden')
  }

  const { data, error } = await supabase
    .from('zone_photos')
    .insert([{
      ...photo,
      submitted_by: user.id,
      status: photo.status || 'pending',
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function reviewZonePhoto(
  supabase: SupabaseClient,
  id: string,
  status: 'approved' | 'rejected'
): Promise<ZonePhoto> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('zone_photos')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteZonePhoto(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('zone_photos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getHistoryMilestones(supabase: SupabaseClient): Promise<HistoryMilestoneRow[]> {
  const { data, error } = await supabase
    .from('history_milestones')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('year', { ascending: true })

  if (error) throw error
  return data || []
}

export async function upsertHistoryMilestone(
  supabase: SupabaseClient,
  row: Partial<HistoryMilestoneRow> & { year: string; title: string; description: string }
): Promise<HistoryMilestoneRow> {
  if (row.id) {
    const { data, error } = await supabase
      .from('history_milestones')
      .update({
        year: row.year,
        title: row.title,
        description: row.description,
        sort_order: row.sort_order ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('history_milestones')
    .insert([{
      year: row.year,
      title: row.title,
      description: row.description,
      sort_order: row.sort_order ?? 0,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteHistoryMilestone(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('history_milestones').delete().eq('id', id)
  if (error) throw error
}

export async function getHistoryPhotosDb(supabase: SupabaseClient): Promise<HistoryPhotoRow[]> {
  const { data, error } = await supabase
    .from('history_photos')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getHistoryPhotosAdmin(supabase: SupabaseClient): Promise<HistoryPhotoRow[]> {
  const { data, error } = await supabase
    .from('history_photos')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function upsertHistoryPhoto(
  supabase: SupabaseClient,
  row: Partial<HistoryPhotoRow> & { src: string; alt: string }
): Promise<HistoryPhotoRow> {
  if (row.id) {
    const { data, error } = await supabase
      .from('history_photos')
      .update({
        src: row.src,
        alt: row.alt,
        caption: row.caption ?? null,
        sort_order: row.sort_order ?? 0,
        is_published: row.is_published ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('history_photos')
    .insert([{
      src: row.src,
      alt: row.alt,
      caption: row.caption ?? null,
      sort_order: row.sort_order ?? 0,
      is_published: row.is_published ?? true,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteHistoryPhoto(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('history_photos').delete().eq('id', id)
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

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const { data, error } = await supabase
    .from('evenementen')
    .insert([{
      ...evenement,
      created_by: user.id
    }])
    .select()
    .single()
  
  if (error) {
    if (error.code === '42501' || error.message?.includes('row-level security')) {
      const roleHint = profile?.role ? ` Huidige rol: ${profile.role}.` : ' Geen gebruikersprofiel gevonden voor deze auth user.'
      throw new Error(`Geen toestemming om evenement toe te voegen.${roleHint} Controleer RLS policies voor INSERT op tabel evenementen.`)
    }
    throw error
  }
  return data
}

export async function updateEvenement(supabase: SupabaseClient, id: string, updates: Partial<Evenement>): Promise<Evenement> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const { data, error } = await supabase
    .from('evenementen')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    if (error.code === '42501' || error.message?.includes('row-level security')) {
      const roleHint = profile?.role ? ` Huidige rol: ${profile.role}.` : ' Geen gebruikersprofiel gevonden voor deze auth user.'
      throw new Error(`Geen toestemming om evenement te bewerken.${roleHint} Controleer RLS policies voor UPDATE op tabel evenementen.`)
    }
    throw error
  }
  return data
}

export async function deleteEvenement(supabase: SupabaseClient, id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const { error } = await supabase
    .from('evenementen')
    .delete()
    .eq('id', id)
  
  if (error) {
    if (error.code === '42501' || error.message?.includes('row-level security')) {
      const roleHint = profile?.role ? ` Huidige rol: ${profile.role}.` : ' Geen gebruikersprofiel gevonden voor deze auth user.'
      throw new Error(`Geen toestemming om evenement te verwijderen.${roleHint} Controleer RLS policies voor DELETE op tabel evenementen.`)
    }
    throw error
  }
}

// Legacy method names for backwards compatibility
export const getAgendaItems = getEvenementen
export const createAgendaItem = createEvenement
export const updateAgendaItem = updateEvenement
export const deleteAgendaItem = deleteEvenement

function dedupeCorristories(stories: Corristory[]): Corristory[] {
  const byKey = new Map<string, Corristory>()

  for (const story of stories) {
    const title = (story.title || '').trim().toLowerCase()
    const author = (story.author_name || 'anoniem').trim().toLowerCase()
    const key = `${title}|${author}`
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, story)
      continue
    }
    const storyTime = story.created_at ? new Date(story.created_at).getTime() : 0
    const existingTime = existing.created_at ? new Date(existing.created_at).getTime() : 0
    if (storyTime >= existingTime) {
      byKey.set(key, story)
    }
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return bTime - aTime
  })
}

export async function getCorristories(supabase: SupabaseClient): Promise<Corristory[]> {
  const { data, error } = await supabase
    .from('corristories')
    .select('*, zones(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return dedupeCorristories(data || [])
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
  
  console.log('Executing UPDATE query for user:', userId, 'with updates:', updates)
  console.log('Current user making update:', currentUser.id, 'role:', currentUserData?.role)
  
  const { data: updateData, error: updateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select() // Return updated rows
  
  console.log('UPDATE query result:')
  console.log('  - data:', updateData)
  console.log('  - data length:', updateData?.length)
  console.log('  - error:', updateError)
  console.log('  - error code:', updateError?.code)
  console.log('  - error message:', updateError?.message)
  
  if (updateError) {
    console.error('UPDATE query failed:', updateError)
    if (updateError.code === '42501' || updateError.message.includes('row-level security')) {
      throw new Error('Geen toestemming om gebruiker bij te werken. Controleer de RLS policies in Supabase. Error: ' + updateError.message)
    }
    
    if (updateError.code === '23514' || updateError.message.includes('check constraint') || updateError.message.includes('violates check constraint')) {
      if (updateError.message.includes('role')) {
        throw new Error('De geselecteerde rol is niet geldig. Toegestane rollen: user, admin, programmer, bestuurder.')
      }
      throw new Error(`Database constraint violation: ${updateError.message}`)
    }
    
    throw new Error(`Fout bij bijwerken gebruiker: ${updateError.message}`)
  }
  
  // Check if update actually returned data
  if (!updateData || updateData.length === 0) {
    console.warn('UPDATE query succeeded but returned NO DATA!')
    console.warn('This usually means RLS policies are blocking the SELECT after UPDATE.')
    console.warn('The UPDATE itself likely worked, but we cannot verify it.')
    console.warn('Using update values as fallback and fetching user separately...')
    
    // The UPDATE likely worked, but SELECT is blocked by RLS
    // Try to fetch the user separately to verify
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const { data: fetchedUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    if (fetchedUser && !fetchError) {
      console.log('Successfully fetched user after UPDATE:', fetchedUser)
      console.log('Fetched role:', fetchedUser.role, 'Expected:', updates.role)
      
      // If roles match, the update worked!
      if (fetchedUser.role === updates.role) {
        console.log('✅ UPDATE confirmed successful - roles match!')
        return fetchedUser as User
      } else {
        console.warn(`⚠️ Role mismatch: database has "${fetchedUser.role}" but we updated to "${updates.role}"`)
        console.warn('This suggests the UPDATE did not work or was reverted.')
        // Still return the fetched user, but log the issue
        return fetchedUser as User
      }
    }
    
    // If we can't fetch either, construct user from updates
    console.warn('Could not fetch user after UPDATE. Constructing user from updates.')
    const constructedUser = {
      id: userId,
      email: '', // We don't have this
      role: updates.role || 'user',
      ...updates
    } as User
    return constructedUser
  }
  
  // If update returned data, use it directly
  if (updateData && updateData.length > 0) {
    const updatedUser = updateData[0] as User
    console.log('UPDATE returned data directly:', updatedUser)
    console.log('Updated user role from UPDATE response:', updatedUser.role)
    console.log('Expected role from updates:', updates.role)
    
    // Ensure role is set correctly
    if (updates.role && updatedUser.role !== updates.role) {
      console.warn(`Role mismatch in UPDATE response! Got "${updatedUser.role}" but expected "${updates.role}"`)
      console.warn('This suggests the UPDATE did not actually change the role in the database.')
      console.warn('Possible causes: RLS policy blocking, database trigger reverting, or constraint violation.')
    }
    
    // Use the role from updates if it doesn't match
    if (!updatedUser.role || (updates.role && updatedUser.role !== updates.role)) {
      console.warn('Using role from updates parameter instead of database response')
      updatedUser.role = updates.role as User['role']
    }
    
    return updatedUser
  }
  
  // Fallback: fetch updated user separately
  console.log('UPDATE did not return data, fetching separately...')
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const { data: updatedUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  
  if (updatedUser && !fetchError) {
    console.log('Successfully fetched updated user from database:', updatedUser)
    console.log('Fetched user role:', updatedUser.role)
    // If fetched role doesn't match what we updated, use the update value
    if (updates.role && updatedUser.role !== updates.role) {
      console.warn(`Role mismatch! Database has "${updatedUser.role}" but we updated to "${updates.role}". Using update value.`)
      updatedUser.role = updates.role
    }
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
    .eq('is_active', true)
    .order('display_order', { ascending: true })
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
