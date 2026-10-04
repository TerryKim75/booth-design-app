-- ─────────────────────────────────────────────────────────────
-- 공지사항 (관리자 대시보드 상단에 노출되는 직원용 공지)
-- SQL Editor의 search_path에 public이 없을 수 있어 모든 객체를 스키마로 한정한다.
-- ─────────────────────────────────────────────────────────────

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  status public.content_status not null default 'published'::public.content_status,
  is_pinned boolean not null default false,
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_notices_status on public.notices(status);

create or replace function public.notices_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_notices_updated before update on public.notices
  for each row execute function public.notices_set_updated_at();

alter table public.notices enable row level security;

-- 직원(staff)·관리자 조회, 작성/수정/삭제는 관리자만
create policy notices_staff_read on public.notices for select using (public.is_staff_or_admin());
create policy notices_admin_insert on public.notices for insert with check (public.is_admin());
create policy notices_admin_update on public.notices for update using (public.is_admin());
create policy notices_admin_delete on public.notices for delete using (public.is_admin());

notify pgrst, 'reload schema';
