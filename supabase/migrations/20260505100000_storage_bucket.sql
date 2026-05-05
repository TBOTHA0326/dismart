-- Create a single public storage bucket for all uploaded images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dismart',
  'dismart',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Public read access (needed for the customer-facing web app)
create policy "Public read dismart bucket"
  on storage.objects for select
  using (bucket_id = 'dismart');

-- Authenticated users (CMS staff) can upload
create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'dismart');

-- Authenticated users can replace their own uploads
create policy "Authenticated users can update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'dismart');

-- Authenticated users can delete uploads
create policy "Authenticated users can delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'dismart');
