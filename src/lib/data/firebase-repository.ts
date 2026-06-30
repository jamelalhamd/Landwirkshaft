import 'server-only'
import type { DocumentSnapshot } from 'firebase-admin/firestore'
import type { ContentRepository } from './repository'
import type {
  NewsArticle,
  OfficialDocument,
  ResearchPaper,
  StaffMember,
  Department,
  SiteStat,
  MediaItem,
} from '@/lib/supabase/types'
import { adminDb } from '@/lib/firebase/admin'

// Converts a Firestore Timestamp or ISO string to an ISO string
function toIso(val: unknown): string {
  if (!val) return new Date().toISOString()
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null && typeof (val as { toDate?: unknown }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString()
  }
  return String(val)
}

function toNews(doc: DocumentSnapshot): NewsArticle {
  const v = doc.data() ?? {}
  return {
    id: doc.id,
    slug: (v['slug'] as string | undefined) ?? doc.id,
    title_ar: (v['title_ar'] as string | undefined) ?? '',
    title_en: (v['title_en'] as string | undefined) ?? '',
    excerpt_ar: (v['excerpt_ar'] as string | undefined) ?? '',
    excerpt_en: (v['excerpt_en'] as string | undefined) ?? '',
    body_ar: (v['body_ar'] as string | undefined) ?? '',
    body_en: (v['body_en'] as string | undefined) ?? '',
    cover_image_url: (v['cover_image_url'] as string | null | undefined) ?? null,
    category_id: (v['category_id'] as string | null | undefined) ?? null,
    tags: (v['tags'] as string[] | undefined) ?? [],
    is_breaking: (v['is_breaking'] as boolean | undefined) ?? false,
    status: (v['status'] as NewsArticle['status'] | undefined) ?? 'draft',
    publish_at: v['publish_at'] ? toIso(v['publish_at']) : null,
    author_id: (v['author_id'] as string | null | undefined) ?? null,
    created_at: toIso(v['created_at']),
    updated_at: toIso(v['updated_at']),
  }
}

function toDocument(doc: DocumentSnapshot): OfficialDocument {
  const v = doc.data() ?? {}
  return {
    id: doc.id,
    title_ar: (v['title_ar'] as string | undefined) ?? '',
    title_en: (v['title_en'] as string | undefined) ?? '',
    description_ar: (v['description_ar'] as string | null | undefined) ?? null,
    description_en: (v['description_en'] as string | null | undefined) ?? null,
    category: (v['category'] as string | undefined) ?? '',
    file_url: (v['file_url'] as string | undefined) ?? '',
    file_size_bytes: (v['file_size_bytes'] as number | undefined) ?? 0,
    page_count: (v['page_count'] as number | null | undefined) ?? null,
    issued_at: toIso(v['issued_at']),
    status: (v['status'] as OfficialDocument['status'] | undefined) ?? 'draft',
    created_at: toIso(v['created_at']),
  }
}

function toResearch(doc: DocumentSnapshot): ResearchPaper {
  const v = doc.data() ?? {}
  return {
    id: doc.id,
    title_ar: (v['title_ar'] as string | undefined) ?? '',
    title_en: (v['title_en'] as string | undefined) ?? '',
    abstract_ar: (v['abstract_ar'] as string | undefined) ?? '',
    abstract_en: (v['abstract_en'] as string | undefined) ?? '',
    authors: (v['authors'] as string[] | undefined) ?? [],
    field: (v['field'] as string | undefined) ?? '',
    year: (v['year'] as number | undefined) ?? new Date().getFullYear(),
    issn: (v['issn'] as string | null | undefined) ?? null,
    doi: (v['doi'] as string | null | undefined) ?? null,
    pdf_url: (v['pdf_url'] as string | null | undefined) ?? null,
    citations_count: (v['citations_count'] as number | undefined) ?? 0,
    status: (v['status'] as ResearchPaper['status'] | undefined) ?? 'draft',
    created_at: toIso(v['created_at']),
  }
}

function toStaff(doc: DocumentSnapshot): StaffMember {
  const v = doc.data() ?? {}
  return {
    id: doc.id,
    full_name_ar: (v['full_name_ar'] as string | undefined) ?? '',
    full_name_en: (v['full_name_en'] as string | undefined) ?? '',
    position_ar: (v['position_ar'] as string | undefined) ?? '',
    position_en: (v['position_en'] as string | undefined) ?? '',
    department_id: (v['department_id'] as string | undefined) ?? '',
    email: (v['email'] as string | null | undefined) ?? null,
    phone: (v['phone'] as string | null | undefined) ?? null,
    office: (v['office'] as string | null | undefined) ?? null,
    photo_url: (v['photo_url'] as string | null | undefined) ?? null,
    bio_ar: (v['bio_ar'] as string | null | undefined) ?? null,
    bio_en: (v['bio_en'] as string | null | undefined) ?? null,
    display_order: (v['display_order'] as number | undefined) ?? 0,
    is_active: (v['is_active'] as boolean | undefined) ?? true,
    created_at: toIso(v['created_at']),
  }
}

function toDepartment(doc: DocumentSnapshot): Department {
  const v = doc.data() ?? {}
  return {
    id: doc.id,
    slug: (v['slug'] as string | undefined) ?? doc.id,
    name_ar: (v['name_ar'] as string | undefined) ?? '',
    name_en: (v['name_en'] as string | undefined) ?? '',
    description_ar: (v['description_ar'] as string | null | undefined) ?? null,
    description_en: (v['description_en'] as string | null | undefined) ?? null,
    parent_id: (v['parent_id'] as string | null | undefined) ?? null,
  }
}

function toMedia(doc: DocumentSnapshot): MediaItem {
  const v = doc.data() ?? {}
  return {
    id: doc.id,
    type: ((v['type'] as string | undefined) === 'video' ? 'video' : 'image'),
    title_ar: (v['title_ar'] as string | undefined) ?? '',
    title_en: (v['title_en'] as string | undefined) ?? '',
    album: (v['album'] as string | null | undefined) ?? null,
    url: (v['url'] as string | undefined) ?? '',
    thumbnail_url: (v['thumbnail_url'] as string | null | undefined) ?? null,
    taken_at: v['taken_at'] ? toIso(v['taken_at']) : null,
    created_at: toIso(v['created_at']),
  }
}

// Firestore-Implementierung des ContentRepository.
// Erfordert Composite-Indexes für mehrspaltige Abfragen — deploy mit:
//   firebase deploy --only firestore:indexes
export const firebaseRepository: ContentRepository = {
  async getLatestNews(limit) {
    // orderBy omitted — composite index may still be building; sort in memory
    const snap = await adminDb()
      .collection('news')
      .where('status', '==', 'published')
      .get()
    return snap.docs
      .map(toNews)
      .sort((a, b) => (b.publish_at ?? '').localeCompare(a.publish_at ?? ''))
      .slice(0, limit)
  },

  async getBreakingNews() {
    const snap = await adminDb()
      .collection('news')
      .where('is_breaking', '==', true)
      .where('status', '==', 'published')
      .get()
    return snap.docs
      .sort((a, b) => {
        const aAt = a.data()['publish_at'] ? toIso(a.data()['publish_at']) : ''
        const bAt = b.data()['publish_at'] ? toIso(b.data()['publish_at']) : ''
        return bAt.localeCompare(aAt)
      })
      .slice(0, 5)
      .map((d) => {
        const v = d.data()
        return {
          id: d.id,
          title_ar: (v['title_ar'] as string | undefined) ?? '',
          title_en: (v['title_en'] as string | undefined) ?? '',
          slug: (v['slug'] as string | undefined) ?? d.id,
        }
      })
  },

  async getNewsBySlug(slug) {
    const snap = await adminDb()
      .collection('news')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get()
    if (snap.empty) return null
    return toNews(snap.docs[0]!)
  },

  async listStaff(filters) {
    let query = adminDb()
      .collection('staff')
      .where('is_active', '==', true) as FirebaseFirestore.Query
    if (filters?.departmentId) {
      query = query.where('department_id', '==', filters.departmentId)
    }
    const snap = await query.get()
    let list = snap.docs.map(toStaff).sort((a, b) => a.display_order - b.display_order)
    if (filters?.query) {
      const q = filters.query.toLowerCase()
      list = list.filter(
        (s) =>
          s.full_name_ar.toLowerCase().includes(q) ||
          s.full_name_en.toLowerCase().includes(q),
      )
    }
    return list
  },

  async listDepartments() {
    const snap = await adminDb().collection('departments').get()
    return snap.docs.map(toDepartment).sort((a, b) => a.name_ar.localeCompare(b.name_ar, 'ar'))
  },

  async listDocuments() {
    const snap = await adminDb()
      .collection('documents')
      .where('status', '==', 'published')
      .get()
    return snap.docs
      .map(toDocument)
      .sort((a, b) => b.issued_at.localeCompare(a.issued_at))
  },

  async listResearch() {
    const snap = await adminDb()
      .collection('research')
      .where('status', '==', 'published')
      .get()
    return snap.docs
      .map(toResearch)
      .sort((a, b) => b.year - a.year)
  },

  async listMedia() {
    const snap = await adminDb().collection('media').get()
    return snap.docs
      .map(toMedia)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  async getSiteStats() {
    const snap = await adminDb().collection('site_stats').get()
    return snap.docs.map((d) => ({
      key: d.id as SiteStat['key'],
      value: (d.data()['value'] as number | undefined) ?? 0,
      updated_at: toIso(d.data()['updated_at']),
    }))
  },
}
