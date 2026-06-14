/**
 * Hand-authored types that mirror the SQL schema in `supabase/migrations/`.
 * Once Supabase project is connected, regenerate via:
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 */

export type UUID = string
export type ISODateTime = string

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer'
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived'
export type Locale = 'ar' | 'en'

export interface Profile {
  id: UUID
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  created_at: ISODateTime
}

export interface Department {
  id: UUID
  slug: string
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  parent_id: UUID | null
}

export interface StaffMember {
  id: UUID
  full_name_ar: string
  full_name_en: string
  position_ar: string
  position_en: string
  department_id: UUID
  email: string | null
  phone: string | null
  office: string | null
  photo_url: string | null
  bio_ar: string | null
  bio_en: string | null
  display_order: number
  is_active: boolean
  created_at: ISODateTime
}

export interface NewsCategory {
  id: UUID
  slug: string
  name_ar: string
  name_en: string
  color: string | null
}

export interface NewsArticle {
  id: UUID
  slug: string
  title_ar: string
  title_en: string
  excerpt_ar: string
  excerpt_en: string
  body_ar: string
  body_en: string
  cover_image_url: string | null
  category_id: UUID | null
  tags: string[]
  is_breaking: boolean
  status: ContentStatus
  publish_at: ISODateTime | null
  author_id: UUID | null
  created_at: ISODateTime
  updated_at: ISODateTime
}

export interface OfficialDocument {
  id: UUID
  title_ar: string
  title_en: string
  description_ar: string | null
  description_en: string | null
  category: string
  file_url: string
  file_size_bytes: number
  page_count: number | null
  issued_at: ISODateTime
  status: ContentStatus
  created_at: ISODateTime
}

export interface ResearchPaper {
  id: UUID
  title_ar: string
  title_en: string
  abstract_ar: string
  abstract_en: string
  authors: string[]
  field: string
  year: number
  issn: string | null
  doi: string | null
  pdf_url: string | null
  citations_count: number
  status: ContentStatus
  created_at: ISODateTime
}

export interface MediaItem {
  id: UUID
  type: 'image' | 'video'
  title_ar: string
  title_en: string
  album: string | null
  url: string
  thumbnail_url: string | null
  taken_at: ISODateTime | null
  created_at: ISODateTime
}

export interface ContactMessage {
  id: UUID
  full_name: string
  email: string
  phone: string | null
  subject: string
  body: string
  department_id: UUID | null
  attachment_url: string | null
  status: 'new' | 'in_review' | 'replied' | 'closed'
  created_at: ISODateTime
}

export interface AuditLog {
  id: UUID
  actor_id: UUID
  action: string
  resource_type: string
  resource_id: UUID | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: ISODateTime
}

export interface SiteStat {
  key: 'research' | 'projects' | 'seeds' | 'researchers'
  value: number
  updated_at: ISODateTime
}
