-- ─────────────────────────────────────────────────────────────
-- 공지사항 (관리자 대시보드 상단에 노출되는 직원용 공지)
-- RLS는 켜되 정책을 두지 않아 anon/authenticated 접근을 모두 차단한다.
-- 앱은 service role로만 접근하고 권한 검사는 서버 코드(requireAdmin 등)에서 한다.
-- ─────────────────────────────────────────────────────────────

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  status text not null default 'published' check (status in ('draft', 'published', 'unpublished')),
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

notify pgrst, 'reload schema';
