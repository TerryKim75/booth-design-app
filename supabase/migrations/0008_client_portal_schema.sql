-- ─────────────────────────────────────────────────────────────
-- 고객사 포털: clients / construction_teams / client_projects / client_project_files
-- ─────────────────────────────────────────────────────────────

create type client_project_stage as enum ('ongoing', 'completed');
create type client_project_file_category as enum (
  'graphic_source', 'final_design', 'graphic_manual', 'construction_photo'
);

-- ─────────────────────────────────────────
-- clients (고객사)
-- ─────────────────────────────────────────
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  address text not null default '',
  note text not null default '',
  status user_status not null default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_clients_status on public.clients(status);

-- profiles: client 계정을 소속 고객사에 연결한다. 로그인 계정이 남아있는 고객사는
-- 삭제할 수 없도록 restrict(먼저 계정을 정리하거나 비활성화해야 함).
alter table public.profiles add column client_id uuid references public.clients(id) on delete restrict;
create index idx_profiles_client_id on public.profiles(client_id);

-- ─────────────────────────────────────────
-- construction_teams (부스 시공팀 — 관리자가 관리하는 lookup)
-- ─────────────────────────────────────────
create table public.construction_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text not null default '',
  contact_phone text not null default '',
  note text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- client_projects
-- ─────────────────────────────────────────
create table public.client_projects (
  id uuid primary key default gen_random_uuid(),
  design_code text not null unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  title text not null,
  stage client_project_stage not null default 'ongoing',
  construction_team_id uuid references public.construction_teams(id) on delete set null,
  site_prep_start_date date,
  site_prep_end_date date,
  construction_start_date date,
  construction_end_date date,
  teardown_start_date date,
  teardown_end_date date,
  note text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_client_projects_client on public.client_projects(client_id);
create index idx_client_projects_stage on public.client_projects(stage);
create index idx_client_projects_team on public.client_projects(construction_team_id);

-- ─────────────────────────────────────────
-- client_project_files ("File Attachment" 엔티티 — 4개 카테고리를 한 테이블로)
-- ─────────────────────────────────────────
create table public.client_project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  category client_project_file_category not null,
  file_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text not null default '',
  file_size_bytes bigint not null default 0,
  uploaded_by uuid references public.profiles(id),
  uploaded_by_role user_role not null,
  created_at timestamptz not null default now()
);
create index idx_cpf_project on public.client_project_files(project_id);
create index idx_cpf_category on public.client_project_files(category);

-- ─────────────────────────────────────────
-- updated_at 트리거 (기존 set_updated_at() 재사용)
-- ─────────────────────────────────────────
create trigger trg_clients_updated before update on public.clients
  for each row execute function public.set_updated_at();
create trigger trg_construction_teams_updated before update on public.construction_teams
  for each row execute function public.set_updated_at();
create trigger trg_client_projects_updated before update on public.client_projects
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table public.clients enable row level security;
alter table public.construction_teams enable row level security;
alter table public.client_projects enable row level security;
alter table public.client_project_files enable row level security;

-- clients: staff/admin 전체, client는 본인 소속 회사 행만 조회
create policy clients_staff_read on public.clients for select
  using (
    public.is_staff_or_admin()
    or (public.is_client() and id = (select client_id from public.profiles where id = auth.uid()))
  );
create policy clients_staff_write on public.clients for insert with check (public.is_staff_or_admin());
create policy clients_staff_update on public.clients for update using (public.is_staff_or_admin());
create policy clients_admin_delete on public.clients for delete using (public.is_admin());

-- construction_teams: staff/admin 전체 관리, client는 조회만(자기 프로젝트의 담당팀 이름 표시용)
create policy teams_read on public.construction_teams for select
  using (public.is_staff_or_admin() or public.is_client());
create policy teams_staff_write on public.construction_teams for insert with check (public.is_staff_or_admin());
create policy teams_staff_update on public.construction_teams for update using (public.is_staff_or_admin());
create policy teams_admin_delete on public.construction_teams for delete using (public.is_admin());

-- client_projects: staff/admin 전체, client는 본인 회사 프로젝트만 조회. 쓰기는 staff/admin만.
create policy cp_read on public.client_projects for select
  using (
    public.is_staff_or_admin()
    or (public.is_client() and client_id = (select client_id from public.profiles where id = auth.uid()))
  );
create policy cp_staff_write on public.client_projects for insert with check (public.is_staff_or_admin());
create policy cp_staff_update on public.client_projects for update using (public.is_staff_or_admin());
create policy cp_admin_delete on public.client_projects for delete using (public.is_admin());

-- client_project_files: staff/admin 전체. client는 본인 회사 프로젝트의 파일만 조회 가능하고,
-- 업로드(insert)는 category='graphic_source'인 자기 회사 프로젝트에 대해서만 허용한다.
-- update 정책은 두지 않는다 — 파일은 불변 객체이며 교체는 새로 insert하는 방식으로 처리한다.
create policy cpf_read on public.client_project_files for select
  using (
    public.is_staff_or_admin()
    or (
      public.is_client()
      and exists (
        select 1 from public.client_projects p
        join public.profiles me on me.id = auth.uid()
        where p.id = client_project_files.project_id and p.client_id = me.client_id
      )
    )
  );
create policy cpf_staff_write on public.client_project_files for insert with check (public.is_staff_or_admin());
create policy cpf_client_write_graphic_source on public.client_project_files for insert
  with check (
    public.is_client()
    and category = 'graphic_source'
    and exists (
      select 1 from public.client_projects p
      join public.profiles me on me.id = auth.uid()
      where p.id = client_project_files.project_id and p.client_id = me.client_id
    )
  );
create policy cpf_admin_delete on public.client_project_files for delete using (public.is_admin());
create policy cpf_client_delete_own_graphic_source on public.client_project_files for delete
  using (public.is_client() and category = 'graphic_source' and uploaded_by = auth.uid());
