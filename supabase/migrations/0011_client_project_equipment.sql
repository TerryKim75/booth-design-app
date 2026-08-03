-- ─────────────────────────────────────────────────────────────
-- 고객사 포털 비품리스트: (1) 비품임대 카탈로그에서 선택해 자동 등록 (2) 리스트 파일 직접 업로드
-- ─────────────────────────────────────────────────────────────

-- ── (1) 비품임대 선택 결과 — 구조화된 라인 아이템 ──
-- rental_items의 이름/카테고리/가격은 이후 바뀔 수 있으므로 선택 시점 값을 스냅샷으로 저장한다
-- (rental_item_id는 참고용 링크일 뿐이며, 삭제되어도 이 행은 그대로 남는다).
create table public.client_project_equipment_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  rental_item_id uuid references public.rental_items(id) on delete set null,
  name text not null,
  category rental_category,
  qty integer not null default 1 check (qty > 0),
  unit_price numeric,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index idx_cpei_project on public.client_project_equipment_items(project_id);

alter table public.client_project_equipment_items enable row level security;

-- 조회: staff/admin 전체, client는 본인 회사 프로젝트 행만
create policy cpei_read on public.client_project_equipment_items for select
  using (
    public.is_staff_or_admin()
    or (
      public.is_client()
      and exists (
        select 1 from public.client_projects p
        join public.profiles me on me.id = auth.uid()
        where p.id = client_project_equipment_items.project_id and p.client_id = me.client_id
      )
    )
  );

-- 등록/삭제: 비품 선택 화면(/portal/projects/[id]/equipment)에서 고객사가 직접 관리한다.
-- 같은 회사 계정이면 누구나 공유 프로젝트의 리스트를 관리할 수 있다(개인별 소유 구분 없음).
create policy cpei_client_write on public.client_project_equipment_items for insert
  with check (
    public.is_client()
    and exists (
      select 1 from public.client_projects p
      join public.profiles me on me.id = auth.uid()
      where p.id = client_project_equipment_items.project_id and p.client_id = me.client_id
    )
  );
create policy cpei_client_delete on public.client_project_equipment_items for delete
  using (
    public.is_client()
    and exists (
      select 1 from public.client_projects p
      join public.profiles me on me.id = auth.uid()
      where p.id = client_project_equipment_items.project_id and p.client_id = me.client_id
    )
  );
create policy cpei_staff_write on public.client_project_equipment_items for insert with check (public.is_staff_or_admin());
create policy cpei_admin_delete on public.client_project_equipment_items for delete using (public.is_admin());

-- ── (2) 비품리스트 직접 업로드 — client_project_files의 새 카테고리에 대한 client 쓰기 권한 ──
-- graphic_source 정책과 동일한 형태로 equipment_list 카테고리에 대해서만 client insert/delete를 허용한다.
create policy cpf_client_write_equipment_list on public.client_project_files for insert
  with check (
    public.is_client()
    and category = 'equipment_list'
    and exists (
      select 1 from public.client_projects p
      join public.profiles me on me.id = auth.uid()
      where p.id = client_project_files.project_id and p.client_id = me.client_id
    )
  );
create policy cpf_client_delete_own_equipment_list on public.client_project_files for delete
  using (public.is_client() and category = 'equipment_list' and uploaded_by = auth.uid());

-- ── storage.objects: equipment_list 폴더에 대한 client 업로드 권한 ──
create policy "client write own equipment_list client-project-files" on storage.objects for insert
  with check (
    bucket_id = 'client-project-files' and public.is_client()
    and (storage.foldername(name))[1] = (select client_id::text from public.profiles where id = auth.uid())
    and (storage.foldername(name))[3] = 'equipment_list'
  );
