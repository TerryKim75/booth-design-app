-- ─────────────────────────────────────────────────────────────
-- 고객사 포털 스토리지: client-project-files(그래픽원본/최종디자인/매뉴얼),
-- client-project-photos(시공사진). 둘 다 비공개 버킷이며 getPublicUrl()이 아니라
-- 항상 createSignedUrl()로만 조회한다.
-- 경로 규칙: {client_id}/{project_id}/{category}/{filename}
-- storage.foldername(name)[1] = client_id, [2] = project_id, [3] = category
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  -- AI/PSD 등은 브라우저가 정확한 MIME을 못 붙이는 경우가 많아 MIME 화이트리스트를
  -- 걸지 않고, 확장자 기반 검증을 애플리케이션 레이어에서 수행한다.
  ('client-project-files', 'client-project-files', false, 104857600, null),
  ('client-project-photos', 'client-project-photos', false, 20971520, array['image/jpeg'])
on conflict (id) do nothing;

-- ── client-project-files ──
create policy "staff read client-project-files" on storage.objects for select
  using (bucket_id = 'client-project-files' and public.is_staff_or_admin());
create policy "client read own client-project-files" on storage.objects for select
  using (
    bucket_id = 'client-project-files' and public.is_client()
    and (storage.foldername(name))[1] = (select client_id::text from public.profiles where id = auth.uid())
  );
create policy "staff write client-project-files" on storage.objects for insert
  with check (bucket_id = 'client-project-files' and public.is_staff_or_admin());
create policy "client write own graphic_source client-project-files" on storage.objects for insert
  with check (
    bucket_id = 'client-project-files' and public.is_client()
    and (storage.foldername(name))[1] = (select client_id::text from public.profiles where id = auth.uid())
    and (storage.foldername(name))[3] = 'graphic_source'
  );
create policy "admin delete client-project-files" on storage.objects for delete
  using (bucket_id = 'client-project-files' and public.is_admin());

-- ── client-project-photos (시공 사진, staff/admin만 업로드) ──
create policy "staff read client-project-photos" on storage.objects for select
  using (bucket_id = 'client-project-photos' and public.is_staff_or_admin());
create policy "client read own client-project-photos" on storage.objects for select
  using (
    bucket_id = 'client-project-photos' and public.is_client()
    and (storage.foldername(name))[1] = (select client_id::text from public.profiles where id = auth.uid())
  );
create policy "staff write client-project-photos" on storage.objects for insert
  with check (bucket_id = 'client-project-photos' and public.is_staff_or_admin());
create policy "admin delete client-project-photos" on storage.objects for delete
  using (bucket_id = 'client-project-photos' and public.is_admin());
