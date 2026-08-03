-- ─────────────────────────────────────────────────────────────
-- 보안 강화: is_staff_or_admin()이 지금까지 profiles.status만 확인하고 role은
-- 전혀 확인하지 않고 있었다. 0006에서 'client' role을 추가한 이상, 이 함수를 쓰는
-- 기존 모든 admin 전용 테이블 RLS 정책이 client 계정에게도 그대로 열리게 된다 —
-- role을 명시적으로 확인하도록 고친다. is_admin()도 같은 종류로 status를 전혀
-- 확인하지 않던 버그가 있어 함께 고친다(정지된 admin 계정이 계속 통과하는 문제).
-- create or replace function이므로 기존 정책들은 재작성 없이 그대로 강화된다
-- (정책은 함수를 이름으로 참조할 뿐 본문을 인라인하지 않는다).
-- ─────────────────────────────────────────────────────────────

create or replace function public.is_staff_or_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('staff', 'admin') and status = 'active' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role = 'admin' and status = 'active' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- 고객사 포털 전용 헬퍼 (0006이 먼저 커밋되어 있어야 'client' 값을 참조할 수 있다)
create or replace function public.is_client() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role = 'client' and status = 'active' from public.profiles where id = auth.uid()),
    false
  );
$$;
