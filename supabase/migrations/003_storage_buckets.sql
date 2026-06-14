-- =====================================================================
-- Supabase Storage buckets + access policies
-- =====================================================================

insert into storage.buckets (id, name, public) values
  ('staff-photos',  'staff-photos',  true),
  ('news-images',   'news-images',   true),
  ('documents',     'documents',     true),
  ('research-pdfs', 'research-pdfs', true),
  ('media',         'media',         true),
  ('attachments',   'attachments',   false)  -- contact-form attachments — private
on conflict (id) do nothing;

-- ----- public read policies on the public buckets -----
create policy "Public read: staff-photos"
  on storage.objects for select to public
  using (bucket_id = 'staff-photos');

create policy "Public read: news-images"
  on storage.objects for select to public
  using (bucket_id = 'news-images');

create policy "Public read: documents"
  on storage.objects for select to public
  using (bucket_id = 'documents');

create policy "Public read: research-pdfs"
  on storage.objects for select to public
  using (bucket_id = 'research-pdfs');

create policy "Public read: media"
  on storage.objects for select to public
  using (bucket_id = 'media');

-- ----- editor+ writes to content buckets -----
create policy "Editor write: content buckets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('staff-photos','news-images','documents','research-pdfs','media')
    and public.is_at_least('editor')
  );

create policy "Editor update: content buckets"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('staff-photos','news-images','documents','research-pdfs','media')
    and public.is_at_least('editor')
  );

create policy "Admin delete: content buckets"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('staff-photos','news-images','documents','research-pdfs','media')
    and public.is_at_least('admin')
  );

-- ----- attachments (private) — anonymous can upload via contact form, admins read -----
create policy "Anon insert: attachments"
  on storage.objects for insert to public
  with check (bucket_id = 'attachments');

create policy "Admin read: attachments"
  on storage.objects for select to authenticated
  using (bucket_id = 'attachments' and public.is_at_least('admin'));
