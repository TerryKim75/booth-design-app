-- ─────────────────────────────────────────────────────────────
-- PMS(aso-wms) 연동: 고객사/프로젝트 생성 시 자동 반영을 위한 외부 참조 컬럼.
-- 웹훅 재시도 시 중복 생성되지 않도록(idempotency) wms 쪽 원본 id를 저장해두고
-- upsert의 onConflict 대상으로 사용한다.
-- ─────────────────────────────────────────────────────────────

alter table public.clients add column if not exists wms_client_id text unique;
alter table public.client_projects add column if not exists wms_project_id text unique;
