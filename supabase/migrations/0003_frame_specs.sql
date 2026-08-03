-- ─────────────────────────────────────────────────────────────
-- Frame Specification (시스템 소개 > Frame Specification 섹션)
-- ─────────────────────────────────────────────────────────────

create table public.frame_specs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  specs text[] not null default '{}',
  image text not null default '',
  status content_status not null default 'draft',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_frame_specs_status on public.frame_specs(status);

create trigger trg_frame_specs_updated before update on public.frame_specs
  for each row execute function public.set_updated_at();

alter table public.frame_specs enable row level security;

create policy frame_specs_public_read on public.frame_specs for select using (status = 'published' or public.is_staff_or_admin());
create policy frame_specs_staff_write on public.frame_specs for insert with check (public.is_staff_or_admin());
create policy frame_specs_staff_update on public.frame_specs for update using (public.is_staff_or_admin());
create policy frame_specs_admin_delete on public.frame_specs for delete using (public.is_admin());
