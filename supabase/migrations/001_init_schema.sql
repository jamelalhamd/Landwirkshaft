-- =====================================================================
-- GCSAR Platform — Initial Schema
-- PostgreSQL 15+ / Supabase
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------- Enums ----------
create type user_role        as enum ('super_admin', 'admin', 'editor', 'viewer');
create type content_status   as enum ('draft', 'review', 'published', 'archived');
create type contact_status   as enum ('new', 'in_review', 'replied', 'closed');
create type media_type       as enum ('image', 'video');

-- ---------- profiles ----------
-- 1:1 with auth.users (managed by Supabase Auth)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text not null default '',
  role        user_role not null default 'viewer',
  avatar_url  text,
  created_at  timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);

-- ---------- departments ----------
create table public.departments (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name_ar       text not null,
  name_en       text not null,
  description_ar text,
  description_en text,
  parent_id     uuid references public.departments(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ---------- staff_members ----------
create table public.staff_members (
  id              uuid primary key default gen_random_uuid(),
  full_name_ar    text not null,
  full_name_en    text not null,
  position_ar     text not null,
  position_en     text not null,
  department_id   uuid not null references public.departments(id) on delete restrict,
  email           text,
  phone           text,
  office          text,
  photo_url       text,
  bio_ar          text,
  bio_en          text,
  display_order   int  not null default 100,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index staff_dept_idx          on public.staff_members (department_id);
create index staff_active_idx        on public.staff_members (is_active);
create index staff_name_ar_trgm_idx  on public.staff_members using gin (full_name_ar gin_trgm_ops);
create index staff_name_en_trgm_idx  on public.staff_members using gin (full_name_en gin_trgm_ops);

-- ---------- news_categories ----------
create table public.news_categories (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique,
  name_ar text not null,
  name_en text not null,
  color   text
);

-- ---------- news_articles ----------
create table public.news_articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title_ar        text not null,
  title_en        text not null,
  excerpt_ar      text not null default '',
  excerpt_en      text not null default '',
  body_ar         text not null default '',
  body_en         text not null default '',
  cover_image_url text,
  category_id     uuid references public.news_categories(id) on delete set null,
  tags            text[] not null default '{}',
  is_breaking     boolean not null default false,
  status          content_status not null default 'draft',
  publish_at      timestamptz,
  author_id       uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index news_status_idx        on public.news_articles (status);
create index news_publish_idx       on public.news_articles (publish_at desc);
create index news_breaking_idx      on public.news_articles (is_breaking) where is_breaking = true;
create index news_tags_idx          on public.news_articles using gin (tags);
create index news_title_ar_trgm_idx on public.news_articles using gin (title_ar gin_trgm_ops);
create index news_title_en_trgm_idx on public.news_articles using gin (title_en gin_trgm_ops);

-- ---------- official_documents ----------
create table public.official_documents (
  id              uuid primary key default gen_random_uuid(),
  title_ar        text not null,
  title_en        text not null,
  description_ar  text,
  description_en  text,
  category        text not null,
  file_url        text not null,
  file_size_bytes bigint not null default 0,
  page_count      int,
  issued_at       timestamptz not null,
  status          content_status not null default 'draft',
  uploaded_by     uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index docs_status_idx on public.official_documents (status);
create index docs_issued_idx on public.official_documents (issued_at desc);

-- ---------- research_papers ----------
create table public.research_papers (
  id              uuid primary key default gen_random_uuid(),
  title_ar        text not null,
  title_en        text not null,
  abstract_ar     text not null default '',
  abstract_en     text not null default '',
  authors         text[] not null default '{}',
  field           text not null,
  year            int  not null,
  issn            text,
  doi             text,
  pdf_url         text,
  citations_count int  not null default 0,
  status          content_status not null default 'draft',
  created_at      timestamptz not null default now()
);
create index research_status_idx on public.research_papers (status);
create index research_year_idx   on public.research_papers (year desc);
create index research_field_idx  on public.research_papers (field);

-- ---------- media_items ----------
create table public.media_items (
  id            uuid primary key default gen_random_uuid(),
  type          media_type not null,
  title_ar      text not null,
  title_en      text not null,
  album         text,
  url           text not null,
  thumbnail_url text,
  taken_at      timestamptz,
  created_at    timestamptz not null default now()
);
create index media_album_idx on public.media_items (album);

-- ---------- contact_messages ----------
create table public.contact_messages (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  email          text not null,
  phone          text,
  subject        text not null,
  body           text not null,
  department_id  uuid references public.departments(id) on delete set null,
  attachment_url text,
  status         contact_status not null default 'new',
  ip_address     inet,
  created_at     timestamptz not null default now()
);
create index contact_status_idx on public.contact_messages (status);
create index contact_dept_idx   on public.contact_messages (department_id);

-- ---------- audit_logs (append-only) ----------
create table public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references public.profiles(id) on delete set null,
  action        text not null,
  resource_type text not null,
  resource_id   uuid,
  ip_address    inet,
  user_agent    text,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index audit_actor_idx    on public.audit_logs (actor_id);
create index audit_created_idx  on public.audit_logs (created_at desc);
create index audit_resource_idx on public.audit_logs (resource_type, resource_id);

-- ---------- site_stats ----------
create table public.site_stats (
  key        text primary key,
  value      bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger trg_staff_updated   before update on public.staff_members for each row execute function public.touch_updated_at();
create trigger trg_news_updated    before update on public.news_articles  for each row execute function public.touch_updated_at();

-- ---------- new-user → profile bootstrap ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'viewer');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
