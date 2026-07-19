-- Legends Tracker — endurecer sync de carreras (Supabase Pro)
-- Ejecutar en SQL Editor DESPUÉS de schema.sql (proyecto ya en marcha).
--
-- Qué hace:
-- 1) Función RPC upsert_user_save con control de conflictos (updated_at)
-- 2) Límite de tamaño del JSON (~2 MB) para evitar payloads abusivos
-- 3) Índice por updated_at (consultas / depuración)

create index if not exists user_saves_updated_at_idx
  on public.user_saves (updated_at desc);

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
  -- ~2 MiB: protege la fila ante JSON enorme / abuso
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

comment on function public.upsert_user_save(jsonb, timestamptz) is
  'Upsert seguro de user_saves: conflicto si cloud es más nuevo; max ~2MB.';
