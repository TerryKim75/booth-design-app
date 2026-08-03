-- ─────────────────────────────────────────────────────────────
-- Storage buckets
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio-images', 'portfolio-images', true, 20971520, array['image/jpeg','image/png','image/webp','image/avif']),
  ('booth-design-images', 'booth-design-images', true, 20971520, array['image/jpeg','image/png','image/webp','image/avif']),
  ('rental-images', 'rental-images', true, 20971520, array['image/jpeg','image/png','image/webp','image/avif']),
  ('downloads', 'downloads', true, 524288000, array[
    'application/pdf','application/zip','application/x-zip-compressed',
    'image/jpeg','image/png','application/octet-stream'
  ]),
  ('inquiry-attachments', 'inquiry-attachments', false, 26214400, array[
    'application/pdf','image/jpeg','image/png','application/zip','application/x-zip-compressed','application/octet-stream'
  ])
on conflict (id) do nothing;

-- 공개 이미지 버킷: 누구나 조회, staff 이상만 업로드/수정/삭제
create policy "public read portfolio-images" on storage.objects for select
  using (bucket_id = 'portfolio-images');
create policy "staff write portfolio-images" on storage.objects for insert
  with check (bucket_id = 'portfolio-images' and public.is_staff_or_admin());
create policy "staff update portfolio-images" on storage.objects for update
  using (bucket_id = 'portfolio-images' and public.is_staff_or_admin());
create policy "admin delete portfolio-images" on storage.objects for delete
  using (bucket_id = 'portfolio-images' and public.is_admin());

create policy "public read booth-design-images" on storage.objects for select
  using (bucket_id = 'booth-design-images');
create policy "staff write booth-design-images" on storage.objects for insert
  with check (bucket_id = 'booth-design-images' and public.is_staff_or_admin());
create policy "staff update booth-design-images" on storage.objects for update
  using (bucket_id = 'booth-design-images' and public.is_staff_or_admin());
create policy "admin delete booth-design-images" on storage.objects for delete
  using (bucket_id = 'booth-design-images' and public.is_admin());

create policy "public read rental-images" on storage.objects for select
  using (bucket_id = 'rental-images');
create policy "staff write rental-images" on storage.objects for insert
  with check (bucket_id = 'rental-images' and public.is_staff_or_admin());
create policy "staff update rental-images" on storage.objects for update
  using (bucket_id = 'rental-images' and public.is_staff_or_admin());
create policy "admin delete rental-images" on storage.objects for delete
  using (bucket_id = 'rental-images' and public.is_admin());

create policy "public read downloads" on storage.objects for select
  using (bucket_id = 'downloads');
create policy "staff write downloads" on storage.objects for insert
  with check (bucket_id = 'downloads' and public.is_staff_or_admin());
create policy "staff update downloads" on storage.objects for update
  using (bucket_id = 'downloads' and public.is_staff_or_admin());
create policy "admin delete downloads" on storage.objects for delete
  using (bucket_id = 'downloads' and public.is_admin());

-- 문의 첨부파일: 비공개 버킷. staff 이상만 조회, 익명 업로드 허용(문의 제출 시), 삭제는 admin만.
create policy "staff read inquiry-attachments" on storage.objects for select
  using (bucket_id = 'inquiry-attachments' and public.is_staff_or_admin());
create policy "anon write inquiry-attachments" on storage.objects for insert
  with check (bucket_id = 'inquiry-attachments');
create policy "admin delete inquiry-attachments" on storage.objects for delete
  using (bucket_id = 'inquiry-attachments' and public.is_admin());
