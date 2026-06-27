-- Legends Tracker — instalación NUEVA (proyecto vacío, primera vez)
-- Si ya tienes login/nube funcionando, usa schema-pro-only.sql en su lugar.

create table if not exists public.user_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  display_name text not null,
  contact_email text,
  commission_rate numeric(5, 4) not null default 0.10,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint affiliates_code_format check (code ~ '^[A-Z0-9_-]{3,32}$')
);

create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  affiliate_code text,
  updated_at timestamptz not null default now()
);

alter table public.user_saves enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.affiliates enable row level security;

create index if not exists user_subscriptions_affiliate_code_idx
  on public.user_subscriptions (affiliate_code);

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
