-- ─────────────────────────────────────────────────────────────
-- 고객 포털 로그인 계정의 비밀번호를 관리자가 확인할 수 있도록 별도 테이블에 보관한다.
-- Supabase Auth는 비밀번호를 해시로만 저장해 조회가 불가능하므로, 관리자가 전화 등으로
-- 계정 정보를 안내할 수 있게 profiles와 분리된 admin-only 테이블에 평문을 함께 저장한다.
-- profiles에 직접 컬럼을 추가하지 않는 이유: profiles_self_select 정책이 본인 행 조회를
-- 허용하므로, 비밀번호 컬럼까지 같은 테이블에 두면 노출 표면이 불필요하게 넓어진다.
-- ─────────────────────────────────────────────────────────────

create table public.client_account_passwords (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  password text not null,
  updated_at timestamptz not null default now()
);

alter table public.client_account_passwords enable row level security;

create policy client_account_passwords_admin_only on public.client_account_passwords
  for all using (public.is_admin()) with check (public.is_admin());
