-- Add per-user ownership for simulations (run after 001_simulations.sql)
alter table public.simulations
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- Replace open anon policies with authenticated user policies
drop policy if exists "Allow anon read simulations" on public.simulations;
drop policy if exists "Allow anon insert simulations" on public.simulations;

create policy "Users read own simulations"
  on public.simulations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own simulations"
  on public.simulations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own simulations"
  on public.simulations for delete
  to authenticated
  using (auth.uid() = user_id);
