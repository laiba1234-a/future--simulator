-- Run in Supabase SQL editor to enable cloud save/history
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  created_at timestamptz not null default now(),
  payload jsonb not null
);

alter table public.simulations enable row level security;

create policy "Allow anon read simulations"
  on public.simulations for select
  to anon
  using (true);

create policy "Allow anon insert simulations"
  on public.simulations for insert
  to anon
  with check (true);
