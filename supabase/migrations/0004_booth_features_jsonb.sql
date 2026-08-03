-- ─────────────────────────────────────────────────────────────
-- 부스 디자인 "필수 요소" 항목 개편.
-- 기존 고정 enum(door/counter/tv 등) → 새 9개 항목(창고/미팅룸/반오픈미팅룸/독립전시대/
-- 전면전시대/쇼케이스/선반/비디오월/조명그래픽)으로 교체하고, 각 항목에 수량/사이즈를
-- 자유 텍스트로 기록할 수 있도록 features 컬럼을 `booth_feature[]` → `jsonb`로 변경한다.
-- jsonb 배열의 각 원소 형태: {"feature": "storage", "note": "2개"}
-- (기존 값은 새 항목 체계와 1:1 대응되지 않아 초기화된다 — 데모/시드 데이터이므로
-- 마이그레이션 직후 백필 스크립트로 새 값을 다시 채운다.)
-- ─────────────────────────────────────────────────────────────

alter table public.booth_designs alter column features drop default;
alter table public.booth_designs alter column features type jsonb using '[]'::jsonb;
alter table public.booth_designs alter column features set default '[]'::jsonb;

drop index if exists idx_booth_features;
create index idx_booth_features on public.booth_designs using gin(features);

drop type booth_feature;

-- ─────────────────────────────────────────────────────────────
-- "디자인 스타일" 항목 개편: minimal/technology/premium/open/product_focused →
-- 오픈형/반폐쇄형/폐쇄형/라운드구조/직선구조.
-- (기존 값 역시 새 체계와 대응되지 않아 초기화되며, 백필 스크립트로 다시 채운다.)
-- ─────────────────────────────────────────────────────────────

alter table public.booth_designs alter column style_tags drop default;
alter table public.booth_designs alter column style_tags type text[] using '{}'::text[];
drop type booth_style_tag;
create type booth_style_tag as enum ('open', 'semi_closed', 'closed', 'round_structure', 'straight_structure');
alter table public.booth_designs alter column style_tags type booth_style_tag[] using '{}'::booth_style_tag[];
alter table public.booth_designs alter column style_tags set default '{}'::booth_style_tag[];
