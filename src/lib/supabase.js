import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '');

const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const key = publishableKey || anonKey;

export const supabaseKeySource = publishableKey
  ? 'publishable'
  : anonKey
    ? 'anon'
    : null;

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured ? createClient(url, key) : null;

export async function verifySupabaseConnection() {
  if (!url || !key) {
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
    });

    if (res.ok) {
      return { ok: true, keySource: supabaseKeySource };
    }

    const body = await res.json().catch(() => ({}));
    return {
      ok: false,
      reason: body.message || `HTTP ${res.status}`,
      hint: body.hint,
      keySource: supabaseKeySource,
    };
  } catch (err) {
    return { ok: false, reason: err.message, keySource: supabaseKeySource };
  }
}
