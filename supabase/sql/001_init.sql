create extension if not exists pgcrypto;

create table if not exists public.tracker_admins (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tracker_tasks (
  id uuid primary key default gen_random_uuid(),
  source_row integer unique,
  order_number text,
  concepto text not null,
  responsable text not null default '',
  status text not null default 'atencion' check (
    status in ('en_avance', 'atencion', 'atorado', 'completado')
  ),
  comentarios text not null default '',
  fecha_raw text not null default '',
  fecha_iso date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tracker_tasks_status_idx on public.tracker_tasks (status);
create index if not exists tracker_tasks_source_row_idx on public.tracker_tasks (source_row);
create index if not exists tracker_tasks_fecha_iso_idx on public.tracker_tasks (fecha_iso);
create index if not exists tracker_tasks_concepto_idx on public.tracker_tasks (lower(concepto));
create index if not exists tracker_tasks_responsable_idx on public.tracker_tasks (lower(responsable));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists tracker_tasks_set_updated_at on public.tracker_tasks;

create trigger tracker_tasks_set_updated_at
before update on public.tracker_tasks
for each row
execute function public.set_updated_at();

create or replace function public.is_tracker_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.tracker_admins
    where lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  );
$$;

grant execute on function public.is_tracker_admin() to anon, authenticated;

alter table public.tracker_admins enable row level security;
alter table public.tracker_tasks enable row level security;

drop policy if exists tracker_admins_self_read on public.tracker_admins;
create policy tracker_admins_self_read
on public.tracker_admins
for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists tracker_tasks_admin_select on public.tracker_tasks;
create policy tracker_tasks_admin_select
on public.tracker_tasks
for select
to authenticated
using (public.is_tracker_admin());

drop policy if exists tracker_tasks_admin_insert on public.tracker_tasks;
create policy tracker_tasks_admin_insert
on public.tracker_tasks
for insert
to authenticated
with check (public.is_tracker_admin());

drop policy if exists tracker_tasks_admin_update on public.tracker_tasks;
create policy tracker_tasks_admin_update
on public.tracker_tasks
for update
to authenticated
using (public.is_tracker_admin())
with check (public.is_tracker_admin());

comment on table public.tracker_admins is 'Correos autorizados para operar el panel administrativo del tracker.';
comment on table public.tracker_tasks is 'Tracker ejecutivo del CEO/COO importado desde Excel y administrado desde Next.js.';
