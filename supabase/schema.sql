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

create index if not exists user_saves_updated_at_idx
  on public.user_saves (updated_at desc);

-- Sync endurecido (también en schema-sync-hardening.sql)
create or replace function public.upsert_user_save(
  p_data jsonb,
  p_expected_updated_at timestamptz default null
)
returns table (
  out_updated_at timestamptz,
  out_conflict boolean,
  out_data jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_existing_updated_at timestamptz;
  v_existing_data jsonb;
  v_new_updated_at timestamptz := now();
  v_size integer;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  v_size := pg_column_size(p_data);
  if v_size > 2097152 then
    raise exception 'save too large (% bytes)', v_size using errcode = 'P0001';
  end if;

  select us.updated_at, us.data
    into v_existing_updated_at, v_existing_data
  from public.user_saves us
  where us.user_id = v_uid
  for update;

  if v_existing_updated_at is not null
     and p_expected_updated_at is not null
     and v_existing_updated_at > p_expected_updated_at then
    return query select v_existing_updated_at, true, v_existing_data;
    return;
  end if;

  insert into public.user_saves (user_id, data, updated_at)
  values (v_uid, p_data, v_new_updated_at)
  on conflict (user_id) do update
    set data = excluded.data,
        updated_at = excluded.updated_at;

  return query select v_new_updated_at, false, p_data;
end;
$$;

revoke all on function public.upsert_user_save(jsonb, timestamptz) from public;
grant execute on function public.upsert_user_save(jsonb, timestamptz) to authenticated;
