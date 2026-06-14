-- =====================================================================
-- Seed data — minimal bootstrap to make a fresh DB usable
-- =====================================================================

insert into public.site_stats (key, value) values
  ('research',     1247),
  ('projects',       86),
  ('seeds',         312),
  ('researchers',   540)
on conflict (key) do nothing;

insert into public.departments (slug, name_ar, name_en) values
  ('plant-protection', 'إدارة وقاية النبات',     'Plant Protection'),
  ('field-crops',      'إدارة المحاصيل الحقلية',  'Field Crops'),
  ('horticulture',     'إدارة البستنة',           'Horticulture'),
  ('soil-water',       'إدارة التربة والمياه',    'Soil & Water'),
  ('biotech',          'إدارة التقانات الحيوية',  'Biotechnology')
on conflict (slug) do nothing;

insert into public.news_categories (slug, name_ar, name_en, color) values
  ('announcements', 'إعلانات',  'Announcements', '#1a4e9c'),
  ('research',      'أبحاث',    'Research',      '#16a34a'),
  ('events',        'فعاليات',  'Events',        '#7c3aed'),
  ('partnerships',  'شراكات',   'Partnerships',  '#dc2626')
on conflict (slug) do nothing;
