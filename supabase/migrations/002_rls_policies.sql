-- =====================================================================
-- Row Level Security — Government-grade access control
-- Anonymous: read-only to published content
-- Viewer:    read-only to all content (incl. drafts they're authorized for)
-- Editor:    CRUD content (no role changes)
-- Admin:     CRUD content + manage roles (except super_admin)
-- Super admin: full access
-- =====================================================================

-- ---------- helper: role lookup ----------
create or replace function public.current_role()
returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_at_least(needed user_role)
returns boolean language sql stable as $$
  with ranks as (
    select 'viewer'::user_role as r, 1 as n union all
    select 'editor',  2 union all
    select 'admin',   3 union all
    select 'super_admin', 4
  )
  select coalesce(
    (select cur.n >= req.n
       from ranks cur, ranks req
       where cur.r = public.current_role() and req.r = needed),
    false
  )
$$;

-- =====================================================================
-- Enable RLS on every table
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.departments         enable row level security;
alter table public.staff_members       enable row level security;
alter table public.news_categories     enable row level security;
alter table public.news_articles       enable row level security;
alter table public.official_documents  enable row level security;
alter table public.research_papers     enable row level security;
alter table public.media_items         enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.audit_logs          enable row level security;
alter table public.site_stats          enable row level security;

-- =====================================================================
-- profiles
-- =====================================================================
create policy "profile: self read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profile: admin read all"
  on public.profiles for select
  using (public.is_at_least('admin'));

create policy "profile: self update non-role fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "profile: admin manage"
  on public.profiles for all
  using (public.is_at_least('admin'))
  with check (
    public.is_at_least('admin')
    and (role <> 'super_admin' or public.is_at_least('super_admin'))
  );

-- =====================================================================
-- departments (public read; admin write)
-- =====================================================================
create policy "dept: public read"        on public.departments for select using (true);
create policy "dept: admin write"        on public.departments for all
  using (public.is_at_least('admin')) with check (public.is_at_least('admin'));

-- =====================================================================
-- staff_members (public read active; editor+ write)
-- =====================================================================
create policy "staff: public read active"
  on public.staff_members for select
  using (is_active = true or public.is_at_least('editor'));

create policy "staff: editor write"
  on public.staff_members for all
  using (public.is_at_least('editor')) with check (public.is_at_least('editor'));

-- =====================================================================
-- news_categories (public read; editor write)
-- =====================================================================
create policy "newscat: public read" on public.news_categories for select using (true);
create policy "newscat: editor write" on public.news_categories for all
  using (public.is_at_least('editor')) with check (public.is_at_least('editor'));

-- =====================================================================
-- news_articles (public reads published; editor+ all)
-- =====================================================================
create policy "news: public read published"
  on public.news_articles for select
  using (status = 'published' and (publish_at is null or publish_at <= now()));

create policy "news: editor read all"
  on public.news_articles for select
  using (public.is_at_least('editor'));

create policy "news: editor insert"
  on public.news_articles for insert
  with check (public.is_at_least('editor'));

create policy "news: editor update own drafts or admin update all"
  on public.news_articles for update
  using (
    (public.is_at_least('editor') and (author_id = auth.uid() or public.is_at_least('admin')))
  )
  with check (
    public.is_at_least('editor')
    -- non-admins cannot publish — workflow forces admin gate
    and (status <> 'published' or public.is_at_least('admin'))
  );

create policy "news: admin delete"
  on public.news_articles for delete
  using (public.is_at_least('admin'));

-- =====================================================================
-- official_documents (public read published; editor write)
-- =====================================================================
create policy "docs: public read published"
  on public.official_documents for select
  using (status = 'published');

create policy "docs: editor read all"
  on public.official_documents for select
  using (public.is_at_least('editor'));

create policy "docs: editor write"
  on public.official_documents for all
  using (public.is_at_least('editor'))
  with check (
    public.is_at_least('editor')
    and (status <> 'published' or public.is_at_least('admin'))
  );

-- =====================================================================
-- research_papers (public read published; editor write)
-- =====================================================================
create policy "research: public read published"
  on public.research_papers for select
  using (status = 'published');

create policy "research: editor manage"
  on public.research_papers for all
  using (public.is_at_least('editor'))
  with check (public.is_at_least('editor'));

-- =====================================================================
-- media_items (public read; editor write)
-- =====================================================================
create policy "media: public read"  on public.media_items for select using (true);
create policy "media: editor write" on public.media_items for all
  using (public.is_at_least('editor')) with check (public.is_at_least('editor'));

-- =====================================================================
-- contact_messages
-- Anonymous can INSERT only (the contact form). Admins read/update.
-- =====================================================================
create policy "contact: anon insert"
  on public.contact_messages for insert
  with check (true);

create policy "contact: admin read"
  on public.contact_messages for select
  using (public.is_at_least('admin'));

create policy "contact: admin update"
  on public.contact_messages for update
  using (public.is_at_least('admin'))
  with check (public.is_at_least('admin'));

-- (no delete policy — messages are kept for audit)

-- =====================================================================
-- audit_logs — append-only, super_admin reads
-- =====================================================================
create policy "audit: actor insert"
  on public.audit_logs for insert
  with check (auth.uid() is not null);

create policy "audit: super_admin read"
  on public.audit_logs for select
  using (public.is_at_least('super_admin'));

-- No update / delete — logs are immutable.

-- =====================================================================
-- site_stats (public read; admin write)
-- =====================================================================
create policy "stats: public read"  on public.site_stats for select using (true);
create policy "stats: admin write"  on public.site_stats for all
  using (public.is_at_least('admin')) with check (public.is_at_least('admin'));
