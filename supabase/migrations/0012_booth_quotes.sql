-- ─────────────────────────────────────────────────────────────
-- 부스 디자인 자동화 도구 — 견적 요청 (quote_requests)
-- ─────────────────────────────────────────────────────────────

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  event_name text,
  event_date date,
  notes text,

  booth_size_id text not null,
  booth_size_label text not null,
  booth_width numeric not null,
  booth_depth numeric not null,
  open_faces smallint not null default 1,

  logo_text text,
  chair_count integer not null default 0,
  table_count integer not null default 0,
  tv_count integer not null default 0,
  has_reception boolean not null default false,
  has_storage_room boolean not null default false,
  has_meeting_room boolean not null default false,
  lighting_type text not null default 'basic',
  graphic_coverage text not null default 'none',

  status text not null default 'pending'
    check (status in ('pending', 'reviewing', 'quoted', 'confirmed', 'cancelled')),

  created_at timestamptz not null default now()
);

create index quote_requests_status_idx on public.quote_requests (status);
create index quote_requests_created_at_idx on public.quote_requests (created_at desc);

alter table public.quote_requests enable row level security;

create policy quote_requests_anon_insert on public.quote_requests for insert with check (true);
create policy quote_requests_staff_read on public.quote_requests for select using (public.is_staff_or_admin());
create policy quote_requests_staff_update on public.quote_requests for update using (public.is_staff_or_admin());
create policy quote_requests_admin_delete on public.quote_requests for delete using (public.is_admin());
