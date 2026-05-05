-- Public storage bucket for deal pamphlets (images and PDFs, up to 20 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deals',
  'deals',
  true,
  20971520, -- 20 MB
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy "Public read deals bucket"
  on storage.objects for select
  using (bucket_id = 'deals');

create policy "Authenticated users can upload to deals"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'deals');

create policy "Authenticated users can update deals"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'deals');

create policy "Authenticated users can delete from deals"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'deals');
