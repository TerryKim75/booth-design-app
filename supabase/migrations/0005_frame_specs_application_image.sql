-- ─────────────────────────────────────────────────────────────
-- Frame Specification 카드에 "적용 부스 사진"을 별도로 추가한다.
-- 기본 표시: applicationImage(이 프레임이 적용된 실제 부스 사진)
-- 호버 시 표시: image(프레임 자체 이미지) — 기존 컬럼, 의미만 명확화
-- ─────────────────────────────────────────────────────────────

alter table public.frame_specs add column application_image text not null default '';
