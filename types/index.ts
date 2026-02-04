export interface Zone {
  id: string
  zone_number: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Evenement {
  id: string
  title: string
  description?: string
  start_datetime: string
  end_datetime?: string
  zone_id?: string
  for_girls?: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
  zones?: Zone
}

export interface Corristory {
  id: string
  title: string
  content: string
  author_id?: string
  author_name?: string
  zone_id?: string
  is_published?: boolean
  created_at?: string
  updated_at?: string
  zones?: Zone
}

export interface User {
  id: string
  email: string
  full_name?: string
  role: 'user' | 'admin' | 'programmer' | 'bestuurder'
  created_at?: string
  updated_at?: string
}

export interface Partner {
  id: string
  name: string
  description?: string
  website_url?: string
  logo_url?: string
  zone_id?: string
  type?: 'intern' | 'extern'
  created_at?: string
  updated_at?: string
  zones?: Zone
}

export interface Page {
  id: string
  route: string
  title: string
  content?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface Section {
  id: string
  page_id: string
  title?: string
  content?: string
  order_index?: number
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface NavigationLink {
  id: string
  label: string
  href: string
  order_index?: number
  created_by?: string
  created_at?: string
  updated_at?: string
}
