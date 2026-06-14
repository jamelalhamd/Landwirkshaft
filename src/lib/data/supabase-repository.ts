import 'server-only'
import type { ContentRepository } from './repository'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const supabaseRepository: ContentRepository = {
  async getLatestNews(limit) {
    const sb = await createSupabaseServerClient()
    const { data, error } = await sb
      .from('news_articles')
      .select('*')
      .eq('status', 'published')
      .order('publish_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data ?? []
  },

  async getBreakingNews() {
    const sb = await createSupabaseServerClient()
    const { data, error } = await sb
      .from('news_articles')
      .select('id,title_ar,title_en,slug')
      .eq('status', 'published')
      .eq('is_breaking', true)
      .order('publish_at', { ascending: false })
      .limit(10)
    if (error) throw error
    return data ?? []
  },

  async getNewsBySlug(slug) {
    const sb = await createSupabaseServerClient()
    const { data, error } = await sb.from('news_articles').select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data
  },

  async listStaff(filters) {
    const sb = await createSupabaseServerClient()
    let q = sb.from('staff_members').select('*').eq('is_active', true).order('display_order')
    if (filters?.departmentId) q = q.eq('department_id', filters.departmentId)
    if (filters?.query) q = q.or(`full_name_ar.ilike.%${filters.query}%,full_name_en.ilike.%${filters.query}%`)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  },

  async listDepartments() {
    const sb = await createSupabaseServerClient()
    const { data, error } = await sb.from('departments').select('*').order('name_ar')
    if (error) throw error
    return data ?? []
  },

  async listDocuments() {
    const sb = await createSupabaseServerClient()
    const { data, error } = await sb
      .from('official_documents')
      .select('*')
      .eq('status', 'published')
      .order('issued_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async listResearch() {
    const sb = await createSupabaseServerClient()
    const { data, error } = await sb
      .from('research_papers')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async listMedia() {
    const sb = await createSupabaseServerClient()
    const { data, error } = await sb.from('media_items').select('*').order('taken_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getSiteStats() {
    const sb = await createSupabaseServerClient()
    const { data, error } = await sb.from('site_stats').select('*')
    if (error) throw error
    return data ?? []
  },
}
