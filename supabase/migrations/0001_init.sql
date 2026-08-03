-- ─────────────────────────────────────────────────────────────
-- ASO System Website — Initial schema
-- Run against a Supabase (Postgres) project.
-- 적용: supabase db push  또는  psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────
create type user_role as enum ('admin', 'staff');
create type user_status as enum ('active', 'suspended');
create type content_status as enum ('draft', 'published', 'unpublished');
create type project_type as enum (
  'exhibition_booth', 'showroom', 'brand_space',
  'corporate_office', 'retail_popup', 'event_space'
);
create type system_type as enum ('55mm', '124mm', 'mixed');
create type booth_type as enum ('inline', 'corner', 'peninsula', 'island');
create type frame_type as enum ('55mm', '124mm', 'mixed');
create type booth_feature as enum (
  'storage', 'meeting_room', 'door', 'counter', 'display',
  'wall_graphic', 'seg_graphic', 'formex_graphic', 'tv', 'led',
  'top_sign', 'tower', 'canopy', 'bridge'
);
create type booth_style_tag as enum ('minimal', 'technology', 'premium', 'open', 'product_focused');
create type rental_category as enum (
  'chair', 'table', 'sofa', 'counter', 'display', 'showcase',
  'refrigerator', 'tv_monitor', 'lighting', 'kitchen', 'accessories'
);
create type stock_status as enum ('in_stock', 'low_stock', 'out_of_stock', 'on_order');
create type download_category as enum (
  '3d_source', 'cad_drawing', 'design_manual', 'assembly_manual',
  'graphic_guideline', 'product_catalog', 'specification', 'other'
);
create type access_level as enum ('public', 'member', 'staff');
create type inquiry_status as enum (
  'new', 'reviewing', 'assigned', 'quoting', 'replied', 'on_hold', 'closed'
);

-- ─────────────────────────────────────────
-- profiles — extends auth.users. 회원가입 UI 없음: 관리자만 계정 생성.
-- ─────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role user_role not null default 'staff',
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_staff_or_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select status = 'active' from public.profiles where id = auth.uid()), false);
$$;

-- ─────────────────────────────────────────
-- portfolios
-- ─────────────────────────────────────────
create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  client text not null,
  exhibition text not null,
  year int not null,
  country text not null,
  city text not null,
  booth_width numeric not null,
  booth_depth numeric not null,
  booth_height numeric not null,
  project_type project_type not null,
  industry text not null,
  system_type system_type not null,
  description text not null default '',
  thumbnail text not null default '',
  gallery text[] not null default '{}',
  featured boolean not null default false,
  status content_status not null default 'draft',
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_portfolios_status on public.portfolios(status);
create index idx_portfolios_year on public.portfolios(year);
create index idx_portfolios_country on public.portfolios(country);
create index idx_portfolios_featured on public.portfolios(featured);

-- ─────────────────────────────────────────
-- booth_designs — 200개 이상 확장 고려, 검색 인덱스 다수 적용
-- ─────────────────────────────────────────
create table public.booth_designs (
  id uuid primary key default gen_random_uuid(),
  design_code text not null unique,
  slug text not null unique,
  title text not null,
  width numeric not null,
  depth numeric not null,
  area numeric not null,
  height numeric not null,
  booth_type booth_type not null,
  open_sides int not null check (open_sides between 1 and 4),
  frame_type frame_type not null,
  features booth_feature[] not null default '{}',
  style_tags booth_style_tag[] not null default '{}',
  description text not null default '',
  thumbnail text not null default '',
  gallery text[] not null default '{}',
  floor_plan text,
  material_summary text not null default '',
  featured boolean not null default false,
  status content_status not null default 'draft',
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_booth_status on public.booth_designs(status);
create index idx_booth_width on public.booth_designs(width);
create index idx_booth_depth on public.booth_designs(depth);
create index idx_booth_area on public.booth_designs(area);
create index idx_booth_height on public.booth_designs(height);
create index idx_booth_type on public.booth_designs(booth_type);
create index idx_booth_open_sides on public.booth_designs(open_sides);
create index idx_booth_frame_type on public.booth_designs(frame_type);
create index idx_booth_features on public.booth_designs using gin(features);
create index idx_booth_style_tags on public.booth_designs using gin(style_tags);
create index idx_booth_featured on public.booth_designs(featured);

-- ─────────────────────────────────────────
-- rental_items
-- ─────────────────────────────────────────
create table public.rental_items (
  id uuid primary key default gen_random_uuid(),
  product_code text not null unique,
  slug text not null unique,
  name text not null,
  category rental_category not null,
  width numeric not null,
  depth numeric not null,
  height numeric not null,
  color text not null default '',
  material text not null default '',
  description text not null default '',
  images text[] not null default '{}',
  stock_status stock_status not null default 'in_stock',
  price_visible boolean not null default false,
  rental_price numeric,
  featured boolean not null default false,
  status content_status not null default 'draft',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_rental_category on public.rental_items(category);
create index idx_rental_status on public.rental_items(status);

-- ─────────────────────────────────────────
-- download_files
-- ─────────────────────────────────────────
create table public.download_files (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category download_category not null,
  version text not null default 'v1.0',
  file_type text not null,
  file_size text not null default '',
  file_url text not null default '',
  thumbnail text not null default '',
  description text not null default '',
  access_level access_level not null default 'public',
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_downloads_category on public.download_files(category);
create index idx_downloads_status on public.download_files(status);

-- ─────────────────────────────────────────
-- inquiries
-- ─────────────────────────────────────────
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_number text not null unique,
  company text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  exhibition text,
  country text,
  city text,
  event_date date,
  booth_width numeric,
  booth_depth numeric,
  booth_height numeric,
  budget text,
  booth_design_id uuid references public.booth_designs(id),
  requirements text not null default '',
  attachments text[] not null default '{}',
  status inquiry_status not null default 'new',
  assignee_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_inquiries_status on public.inquiries(status);
create index idx_inquiries_assignee on public.inquiries(assignee_id);

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  author_id uuid references public.profiles(id),
  note text not null,
  created_at timestamptz not null default now()
);
create index idx_inquiry_notes_inquiry on public.inquiry_notes(inquiry_id);

-- ─────────────────────────────────────────
-- site_settings — 메인 카피 등 관리자 수정 가능 텍스트
-- ─────────────────────────────────────────
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- admin_activity_logs — 관리자 작업 로그
-- ─────────────────────────────────────────
create table public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- updated_at 자동 갱신 트리거
-- ─────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_portfolios_updated before update on public.portfolios
  for each row execute function public.set_updated_at();
create trigger trg_booth_designs_updated before update on public.booth_designs
  for each row execute function public.set_updated_at();
create trigger trg_rental_items_updated before update on public.rental_items
  for each row execute function public.set_updated_at();
create trigger trg_download_files_updated before update on public.download_files
  for each row execute function public.set_updated_at();
create trigger trg_inquiries_updated before update on public.inquiries
  for each row execute function public.set_updated_at();
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.booth_designs enable row level security;
alter table public.rental_items enable row level security;
alter table public.download_files enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_activity_logs enable row level security;

-- profiles: 본인 열람, admin은 전체 열람/수정. 가입 INSERT는 없음(관리자가 auth 계정 생성 후 트리거로 profile 생성).
create policy profiles_self_select on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_admin_write on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- portfolios: 공개는 published만, 로그인 사용자(staff/admin)는 전체 열람, 쓰기는 staff/admin만
create policy portfolios_public_read on public.portfolios for select using (status = 'published' or public.is_staff_or_admin());
create policy portfolios_staff_write on public.portfolios for insert with check (public.is_staff_or_admin());
create policy portfolios_staff_update on public.portfolios for update using (public.is_staff_or_admin());
create policy portfolios_admin_delete on public.portfolios for delete using (public.is_admin());

create policy booth_public_read on public.booth_designs for select using (status = 'published' or public.is_staff_or_admin());
create policy booth_staff_write on public.booth_designs for insert with check (public.is_staff_or_admin());
create policy booth_staff_update on public.booth_designs for update using (public.is_staff_or_admin());
create policy booth_admin_delete on public.booth_designs for delete using (public.is_admin());

create policy rental_public_read on public.rental_items for select using (status = 'published' or public.is_staff_or_admin());
create policy rental_staff_write on public.rental_items for insert with check (public.is_staff_or_admin());
create policy rental_staff_update on public.rental_items for update using (public.is_staff_or_admin());
create policy rental_admin_delete on public.rental_items for delete using (public.is_admin());

-- downloads: 공개 범위(access_level)는 API 레이어에서 세션 여부로 추가 필터링
create policy downloads_public_read on public.download_files for select using (status = 'published' or public.is_staff_or_admin());
create policy downloads_staff_write on public.download_files for insert with check (public.is_staff_or_admin());
create policy downloads_staff_update on public.download_files for update using (public.is_staff_or_admin());
create policy downloads_admin_delete on public.download_files for delete using (public.is_admin());

-- inquiries: 익명 사용자도 문의 생성 가능(anon insert), 열람/수정은 staff 이상만
create policy inquiries_anon_insert on public.inquiries for insert with check (true);
create policy inquiries_staff_read on public.inquiries for select using (public.is_staff_or_admin());
create policy inquiries_staff_update on public.inquiries for update using (public.is_staff_or_admin());
create policy inquiries_admin_delete on public.inquiries for delete using (public.is_admin());

create policy inquiry_notes_staff_all on public.inquiry_notes for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

-- site_settings: 공개 읽기, 관리자만 수정
create policy site_settings_public_read on public.site_settings for select using (true);
create policy site_settings_admin_write on public.site_settings for insert with check (public.is_admin());
create policy site_settings_admin_update on public.site_settings for update using (public.is_admin());

create policy admin_logs_admin_read on public.admin_activity_logs for select using (public.is_admin());
create policy admin_logs_staff_insert on public.admin_activity_logs for insert with check (public.is_staff_or_admin());
