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

/**
 * Flujo implicit: Google devuelve tokens en el hash (#access_token=...).
 * Evita el error PKCE «invalid flow state» tan frecuente en SPAs / Strict Mode.
 */
export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
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
  if (current.hash) {
    current.hash = '';
    dirty = true;
  }
  if (dirty) {
    window.history.replaceState({}, '', `${current.pathname}${current.search}`);
  }
}

function readHashParams() {
  if (typeof window === 'undefined' || !window.location.hash) return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ''));
}

function friendlyOAuthError(message) {
  const raw = String(message || '');
  if (/invalid flow state|no valid flow state/i.test(raw)) {
    return 'No se pudo completar el login con Google. Cierra otras pestañas de la app y pulsa otra vez «Continuar con Google».';
  }
  return raw || 'No se pudo completar el inicio con Google.';
}

/** Una sola vez por carga de página. */
let authBootstrapPromise = null;

export function bootstrapAuthSession() {
  if (!supabase) return Promise.resolve({ session: null, error: null });
  if (authBootstrapPromise) return authBootstrapPromise;

  authBootstrapPromise = (async () => {
    const query = new URLSearchParams(window.location.search);
    const hash = readHashParams();
    const oauthError = query.get('error_description')
      || hash.get('error_description')
      || query.get('error')
      || hash.get('error');

    if (oauthError) {
      clearOAuthParamsFromUrl();
      return {
        session: null,
        error: friendlyOAuthError(decodeURIComponent(String(oauthError).replace(/\+/g, ' '))),
      };
    }

    // Legacy PKCE (?code=): intentar canje una sola vez si aparece
    if (query.get('code')) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      clearOAuthParamsFromUrl();
      if (!error && data.session) {
        return { session: data.session, error: null };
      }
      const { data: existing } = await supabase.auth.getSession();
      if (existing?.session) return { session: existing.session, error: null };
      return {
        session: null,
        error: friendlyOAuthError(error?.message || 'invalid flow state'),
      };
    }

    // Implicit: detectSessionInUrl parsea #access_token al inicializar el cliente.
    // getSession() espera a que termine esa inicialización.
    const { data: { session }, error } = await supabase.auth.getSession();
    const hadTokenInHash = hash.has('access_token');
    clearOAuthParamsFromUrl();

    if (error) {
      return { session: null, error: friendlyOAuthError(error.message) };
    }

    if (hadTokenInHash && !session) {
      return {
        session: null,
        error: 'Google respondió, pero no se pudo guardar la sesión. Prueba en otra ventana o desactiva bloqueadores.',
      };
    }

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
