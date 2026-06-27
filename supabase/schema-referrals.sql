-- Legends Tracker — sistema de referidos (creadores de contenido)
-- Ejecuta en Supabase → SQL Editor → Run (proyecto ya en producción)

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

alter table public.user_subscriptions
  add column if not exists affiliate_code text;

create index if not exists user_subscriptions_affiliate_code_idx
  on public.user_subscriptions (affiliate_code);

alter table public.affiliates enable row level security;

-- Solo el servidor (service_role) gestiona afiliados; usuarios no leen la tabla.

-- Ejemplo: crea códigos para creadores (cambia code y display_name)
-- insert into public.affiliates (code, display_name, contact_email)
-- values
--   ('TORRE4', 'Torre4 Gaming', 'creador@email.com'),
--   ('CAREERES', 'Career Mode ES', null)
-- on conflict (code) do nothing;
