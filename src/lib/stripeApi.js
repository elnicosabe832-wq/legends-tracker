import { supabase } from './supabase';
import { apiUrl } from './apiBase';

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Debes iniciar sesión para gestionar Pro.');
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchSubscriptionStatus() {
  const headers = await authHeaders();
  const res = await fetch(apiUrl('/api/stripe/status'), { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'No se pudo comprobar la suscripción.');
  }
  return data;
}

export async function createCheckoutSession() {
  const headers = await authHeaders();
  const res = await fetch(apiUrl('/api/stripe/create-checkout-session'), {
    method: 'POST',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'No se pudo iniciar el pago.');
  }
  if (!data.url) throw new Error('Stripe no devolvió URL de pago.');
  return data.url;
}

export async function createPortalSession() {
  const headers = await authHeaders();
  const res = await fetch(apiUrl('/api/stripe/create-portal-session'), {
    method: 'POST',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'No se pudo abrir facturación.');
  }
  if (!data.url) throw new Error('Stripe no devolvió URL del portal.');
  return data.url;
}

export function isProFromStatus(status) {
  return ACTIVE_STATUSES.has(status);
}
