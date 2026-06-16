-- Legends Tracker — instalación NUEVA (proyecto vacío, primera vez)
-- Si ya tienes login/nube funcionando, usa schema-pro-only.sql en su lugar.

create table if not exists public.user_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_saves enable row level security;
alter table public.user_subscriptions enable row level security;

drop policy if exists "user_saves_select_own" on public.user_saves;
drop policy if exists "user_saves_insert_own" on public.user_saves;
drop policy if exists "user_saves_update_own" on public.user_saves;
drop policy if exists "user_saves_delete_own" on public.user_saves;
drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;

create policy "user_saves_select_own"
  on public.user_saves for select
  using (auth.uid() = user_id);

create policy "user_saves_insert_own"
  on public.user_saves for insert
  with check (auth.uid() = user_id);

create policy "user_saves_update_own"
  on public.user_saves for update
  using (auth.uid() = user_id);

create policy "user_saves_delete_own"
  on public.user_saves for delete
  using (auth.uid() = user_id);

create policy "user_subscriptions_select_own"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);
