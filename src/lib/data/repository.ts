/**
 * Repository — the only place app code reads "content" data from.
 *
 * Switch sources via NEXT_PUBLIC_DATA_SOURCE = "mock" | "supabase".
 * Same interface, two implementations — pages don't change when the DB lights up.
 */

import type {
  NewsArticle,
  OfficialDocument,
  ResearchPaper,
  StaffMember,
  Department,
  SiteStat,
  MediaItem,
} from '@/lib/supabase/types'

export interface ContentRepository {
  getLatestNews(limit: number): Promise<NewsArticle[]>
  getBreakingNews(): Promise<Pick<NewsArticle, 'id' | 'title_ar' | 'title_en' | 'slug'>[]>
  getNewsBySlug(slug: string): Promise<NewsArticle | null>
  listStaff(filters?: { departmentId?: string; query?: string }): Promise<StaffMember[]>
  listDepartments(): Promise<Department[]>
  listDocuments(): Promise<OfficialDocument[]>
  listResearch(): Promise<ResearchPaper[]>
  listMedia(): Promise<MediaItem[]>
  getSiteStats(): Promise<SiteStat[]>
}

const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock'

let cached: ContentRepository | null = null

export async function getRepository(): Promise<ContentRepository> {
  if (cached) return cached
  if (source === 'supabase') {
    const mod = await import('./supabase-repository')
    cached = mod.supabaseRepository
  } else {
    const mod = await import('./mock-repository')
    cached = mod.mockRepository
  }
  return cached
}
