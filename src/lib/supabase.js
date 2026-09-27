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

export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : null;

function clearOAuthParamsFromUrl() {
  if (typeof window === 'undefined') return;
  const current = new URL(window.location.href);
  const oauthKeys = ['code', 'state', 'error', 'error_description', 'error_code'];
  let dirty = false;
  oauthKeys.forEach((k) => {
    if (current.searchParams.has(k)) {
      current.searchParams.delete(k);
      dirty = true;
    }
  });
  if (current.hash && /access_token|error|refresh_token/.test(current.hash)) {
    current.hash = '';
    dirty = true;
  }
  if (dirty) {
    window.history.replaceState({}, '', `${current.pathname}${current.search}`);
  }
}

function friendlyOAuthError(message) {
  const raw = String(message || '');
  if (/invalid flow state|no valid flow state/i.test(raw)) {
    return 'La sesión de Google expiró o se interrumpió. Pulsa otra vez «Continuar con Google».';
  }
  return raw || 'No se pudo completar el inicio con Google.';
}

/** Una sola vez por carga de página (evita doble canje con React Strict Mode). */
let authBootstrapPromise = null;

export function bootstrapAuthSession() {
  if (!supabase) return Promise.resolve({ session: null, error: null });
  if (authBootstrapPromise) return authBootstrapPromise;

  authBootstrapPromise = (async () => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error_description') || params.get('error');

    if (oauthError) {
      clearOAuthParamsFromUrl();
      return {
        session: null,
        error: friendlyOAuthError(decodeURIComponent(String(oauthError).replace(/\+/g, ' '))),
      };
    }

    if (params.get('code')) {
      const href = window.location.href;
      const { data, error } = await supabase.auth.exchangeCodeForSession(href);
      clearOAuthParamsFromUrl();

      if (error) {
        // Si Strict Mode ya canjeó el code, la sesión puede existir igual
        const { data: existing } = await supabase.auth.getSession();
        if (existing?.session) {
          return { session: existing.session, error: null };
        }
        return { session: null, error: friendlyOAuthError(error.message) };
      }

      return { session: data.session ?? null, error: null };
    }

    const { data: { session } } = await supabase.auth.getSession();
    return { session: session ?? null, error: null };
  })();

  return authBootstrapPromise;
}

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
