import type { ContentRepository } from './repository'
import type {
  NewsArticle,
  StaffMember,
  Department,
  OfficialDocument,
  ResearchPaper,
  MediaItem,
  SiteStat,
} from '@/lib/supabase/types'

const now = () => new Date().toISOString()
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

const departments: Department[] = [
  { id: 'dept-1', slug: 'plant-protection', name_ar: 'إدارة وقاية النبات', name_en: 'Plant Protection', description_ar: 'البحوث المتعلقة بأمراض النبات والآفات.', description_en: 'Research on plant diseases and pests.', parent_id: null },
  { id: 'dept-2', slug: 'field-crops', name_ar: 'إدارة المحاصيل الحقلية', name_en: 'Field Crops', description_ar: 'تحسين أصناف المحاصيل الاستراتيجية.', description_en: 'Improvement of strategic crop varieties.', parent_id: null },
  { id: 'dept-3', slug: 'horticulture', name_ar: 'إدارة البستنة', name_en: 'Horticulture', description_ar: 'بحوث الأشجار المثمرة والخضروات.', description_en: 'Research on fruit trees and vegetables.', parent_id: null },
  { id: 'dept-4', slug: 'soil-water', name_ar: 'إدارة التربة والمياه', name_en: 'Soil & Water', description_ar: 'إدارة الموارد المائية والتربة.', description_en: 'Soil and water resource management.', parent_id: null },
  { id: 'dept-5', slug: 'biotech', name_ar: 'إدارة التقانات الحيوية', name_en: 'Biotechnology', description_ar: 'البحوث في التقانات الحيوية الحديثة.', description_en: 'Modern biotechnology research.', parent_id: null },
]

const staff: StaffMember[] = [
  { id: 's-1', full_name_ar: 'د. سامر الحلبي', full_name_en: 'Dr. Samer Al-Halabi', position_ar: 'مدير إدارة وقاية النبات', position_en: 'Director, Plant Protection', department_id: 'dept-1', email: 'samer.halabi@gcsar.gov.sy', phone: '+963-11-555-0101', office: 'مبنى A، طابق 2', photo_url: null, bio_ar: 'باحث متخصص بأمراض النبات منذ عام 2002.', bio_en: 'Plant pathology researcher since 2002.', display_order: 1, is_active: true, created_at: daysAgo(900) },
  { id: 's-2', full_name_ar: 'د. ليلى النابلسي', full_name_en: 'Dr. Layla Al-Nabulsi', position_ar: 'رئيسة قسم تحسين القمح', position_en: 'Head of Wheat Improvement', department_id: 'dept-2', email: 'layla.nabulsi@gcsar.gov.sy', phone: '+963-11-555-0102', office: 'مبنى B، طابق 1', photo_url: null, bio_ar: 'متخصصة بتربية أصناف القمح المقاومة للجفاف.', bio_en: 'Specialist in drought-tolerant wheat breeding.', display_order: 2, is_active: true, created_at: daysAgo(700) },
  { id: 's-3', full_name_ar: 'م. خالد الدمشقي', full_name_en: 'Eng. Khaled Al-Dimashqi', position_ar: 'باحث أول، البستنة', position_en: 'Senior Researcher, Horticulture', department_id: 'dept-3', email: 'khaled.dimashqi@gcsar.gov.sy', phone: '+963-11-555-0103', office: 'مبنى C، طابق 3', photo_url: null, bio_ar: 'أبحاث على شجرة الزيتون السوري.', bio_en: 'Research on Syrian olive trees.', display_order: 3, is_active: true, created_at: daysAgo(500) },
  { id: 's-4', full_name_ar: 'د. منى السواس', full_name_en: 'Dr. Mona Al-Sawwas', position_ar: 'باحثة، تقانات حيوية', position_en: 'Researcher, Biotechnology', department_id: 'dept-5', email: 'mona.sawwas@gcsar.gov.sy', phone: '+963-11-555-0104', office: 'مختبر D-12', photo_url: null, bio_ar: 'تخصص في زراعة الأنسجة النباتية.', bio_en: 'Specialist in plant tissue culture.', display_order: 4, is_active: true, created_at: daysAgo(400) },
]

const news: NewsArticle[] = [
  { id: 'n-1', slug: 'wheat-variety-launch-2026', title_ar: 'إطلاق صنف قمح جديد مقاوم للجفاف', title_en: 'Launch of a new drought-resistant wheat variety', excerpt_ar: 'أعلنت الهيئة عن صنف قمح محلي جديد بإنتاجية أعلى بنسبة 18%.', excerpt_en: 'GCSAR announces a new local wheat variety with 18% higher yield.', body_ar: 'تفاصيل كاملة حول الصنف الجديد ومناطق زراعته…', body_en: 'Full details about the new variety and its growing regions…', cover_image_url: null, category_id: 'cat-1', tags: ['قمح','أصناف','جفاف'], is_breaking: true, status: 'published', publish_at: daysAgo(1), author_id: 's-2', created_at: daysAgo(1), updated_at: daysAgo(1) },
  { id: 'n-2', slug: 'partnership-with-icarda', title_ar: 'توقيع مذكرة تفاهم مع إيكاردا', title_en: 'MoU signed with ICARDA', excerpt_ar: 'تعاون بحثي حول المحاصيل المقاومة للجفاف والملوحة.', excerpt_en: 'Research cooperation on drought- and salt-tolerant crops.', body_ar: 'تشمل المذكرة تبادل الباحثين والبيانات الجينية…', body_en: 'The MoU covers researcher exchanges and genetic data sharing…', cover_image_url: null, category_id: 'cat-2', tags: ['شراكات','إيكاردا'], is_breaking: false, status: 'published', publish_at: daysAgo(4), author_id: 's-1', created_at: daysAgo(4), updated_at: daysAgo(4) },
  { id: 'n-3', slug: 'olive-symposium-2026', title_ar: 'ندوة الزيتون السوري 2026', title_en: '2026 Syrian Olive Symposium', excerpt_ar: 'ندوة علمية في حلب تناقش مستقبل قطاع الزيتون.', excerpt_en: 'Scientific symposium in Aleppo on the future of the olive sector.', body_ar: 'يشارك أكثر من 80 باحثاً وباحثة من المنطقة العربية.', body_en: 'Over 80 researchers from the Arab region are participating.', cover_image_url: null, category_id: 'cat-3', tags: ['زيتون','ندوة'], is_breaking: false, status: 'published', publish_at: daysAgo(8), author_id: 's-3', created_at: daysAgo(8), updated_at: daysAgo(8) },
  { id: 'n-4', slug: 'open-call-research-grants', title_ar: 'فتح باب التقدم لمنح البحث الزراعي', title_en: 'Open call: Agricultural research grants', excerpt_ar: 'فرصة للباحثين الشباب للحصول على تمويل مشاريعهم.', excerpt_en: 'A chance for young researchers to fund their projects.', body_ar: 'آخر موعد للتقديم 30 سبتمبر.', body_en: 'Application deadline: September 30.', cover_image_url: null, category_id: 'cat-4', tags: ['منح','تمويل'], is_breaking: false, status: 'published', publish_at: daysAgo(12), author_id: null, created_at: daysAgo(12), updated_at: daysAgo(12) },
  { id: 'n-5', slug: 'soil-mapping-project', title_ar: 'إنجاز خريطة التربة الرقمية', title_en: 'Digital soil map completed', excerpt_ar: 'إصدار أول خريطة رقمية شاملة للتربة في 4 محافظات.', excerpt_en: 'First comprehensive digital soil map across 4 governorates.', body_ar: 'تتيح الخريطة للمزارعين معرفة خصائص أراضيهم.', body_en: 'The map lets farmers know the characteristics of their land.', cover_image_url: null, category_id: 'cat-5', tags: ['تربة','GIS'], is_breaking: false, status: 'published', publish_at: daysAgo(18), author_id: null, created_at: daysAgo(18), updated_at: daysAgo(18) },
  { id: 'n-6', slug: 'tissue-culture-lab', title_ar: 'افتتاح مختبر زراعة الأنسجة المحدّث', title_en: 'Upgraded tissue culture lab opens', excerpt_ar: 'مختبر بمعايير دولية لإكثار النباتات النادرة.', excerpt_en: 'An internationally certified lab for propagating rare plants.', body_ar: 'يخدم المختبر مشاريع الحفاظ على الأصناف المحلية.', body_en: 'The lab supports conservation of local varieties.', cover_image_url: null, category_id: 'cat-2', tags: ['تقانات','مختبر'], is_breaking: false, status: 'published', publish_at: daysAgo(25), author_id: 's-4', created_at: daysAgo(25), updated_at: daysAgo(25) },
]

const documents: OfficialDocument[] = [
  { id: 'd-1', title_ar: 'قرار اعتماد صنف القمح الجديد', title_en: 'Decree adopting the new wheat variety', description_ar: null, description_en: null, category: 'قرار', file_url: '/docs/sample.pdf', file_size_bytes: 245_000, page_count: 4, issued_at: daysAgo(2), status: 'published', created_at: daysAgo(2) },
  { id: 'd-2', title_ar: 'التقرير السنوي 2025', title_en: 'Annual Report 2025', description_ar: null, description_en: null, category: 'تقرير', file_url: '/docs/sample.pdf', file_size_bytes: 4_200_000, page_count: 88, issued_at: daysAgo(60), status: 'published', created_at: daysAgo(60) },
  { id: 'd-3', title_ar: 'دليل المزارع للري بالتنقيط', title_en: 'Farmer guide: drip irrigation', description_ar: null, description_en: null, category: 'منشور', file_url: '/docs/sample.pdf', file_size_bytes: 1_100_000, page_count: 24, issued_at: daysAgo(120), status: 'published', created_at: daysAgo(120) },
]

const research: ResearchPaper[] = [
  { id: 'r-1', title_ar: 'تحسين إنتاجية القمح في المناطق شبه الجافة', title_en: 'Wheat productivity improvement in semi-arid zones', abstract_ar: 'دراسة تجريبية لثلاث سنوات على 6 مواقع في سوريا.', abstract_en: 'A three-year experimental study at 6 sites across Syria.', authors: ['د. ليلى النابلسي', 'م. علي حداد'], field: 'المحاصيل الحقلية', year: 2025, issn: '2520-7393', doi: null, pdf_url: '/docs/sample.pdf', citations_count: 14, status: 'published', created_at: daysAgo(180) },
  { id: 'r-2', title_ar: 'مقاومة الزيتون السوري لذبابة الفاكهة', title_en: 'Syrian olive resistance to the fruit fly', abstract_ar: 'تقييم استجابة أصناف زيتون محلية للإصابة.', abstract_en: 'Assessing local olive cultivar responses to infestation.', authors: ['م. خالد الدمشقي'], field: 'البستنة', year: 2024, issn: '2520-7393', doi: null, pdf_url: '/docs/sample.pdf', citations_count: 6, status: 'published', created_at: daysAgo(420) },
]

const media: MediaItem[] = [
  { id: 'm-1', type: 'image', title_ar: 'حقل تجريبي للقمح', title_en: 'Experimental wheat field', album: 'حقول 2025', url: '/media/wheat-field.jpg', thumbnail_url: null, taken_at: daysAgo(40), created_at: daysAgo(40) },
  { id: 'm-2', type: 'image', title_ar: 'مختبر زراعة الأنسجة', title_en: 'Tissue culture lab', album: 'مختبرات', url: '/media/lab.jpg', thumbnail_url: null, taken_at: daysAgo(25), created_at: daysAgo(25) },
]

const stats: SiteStat[] = [
  { key: 'research', value: 1247, updated_at: now() },
  { key: 'projects', value: 86, updated_at: now() },
  { key: 'seeds', value: 312, updated_at: now() },
  { key: 'researchers', value: 540, updated_at: now() },
]

export const mockRepository: ContentRepository = {
  async getLatestNews(limit) {
    return [...news]
      .filter((n) => n.status === 'published')
      .sort((a, b) => (b.publish_at ?? '').localeCompare(a.publish_at ?? ''))
      .slice(0, limit)
  },
  async getBreakingNews() {
    return news
      .filter((n) => n.is_breaking && n.status === 'published')
      .map(({ id, title_ar, title_en, slug }) => ({ id, title_ar, title_en, slug }))
  },
  async getNewsBySlug(slug) {
    return news.find((n) => n.slug === slug) ?? null
  },
  async listStaff(filters) {
    let list = staff.filter((s) => s.is_active)
    if (filters?.departmentId) list = list.filter((s) => s.department_id === filters.departmentId)
    if (filters?.query) {
      const q = filters.query.toLowerCase()
      list = list.filter((s) => s.full_name_ar.toLowerCase().includes(q) || s.full_name_en.toLowerCase().includes(q))
    }
    return list.sort((a, b) => a.display_order - b.display_order)
  },
  async listDepartments() {
    return departments
  },
  async listDocuments() {
    return documents.filter((d) => d.status === 'published')
  },
  async listResearch() {
    return research.filter((r) => r.status === 'published')
  },
  async listMedia() {
    return media
  },
  async getSiteStats() {
    return stats
  },
}
