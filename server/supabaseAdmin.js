import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const url = process.env.VITE_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export const isSupabaseAdminConfigured = Boolean(url && serviceKey);

export const supabaseAdmin = isSupabaseAdminConfigured
  ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export async function getUserFromAccessToken(accessToken) {
  if (!supabaseAdmin || !accessToken) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !user) return null;
  return user;
}

export async function getSubscriptionRow(userId) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('status, current_period_end, stripe_customer_id, stripe_subscription_id, affiliate_code')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getUserIdByStripeCustomer(customerId) {
  if (!supabaseAdmin || !customerId) return null;
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.user_id ?? null;
}

export async function upsertSubscriptionRow({
  userId,
  customerId,
  subscriptionId,
  status,
  periodEnd,
  affiliateCode,
}) {
  if (!supabaseAdmin) throw new Error('Supabase admin no configurado');

  let code = affiliateCode ? normalizeAffiliateCode(affiliateCode) : null;
  if (!code) {
    const existing = await getSubscriptionRow(userId);
    code = existing?.affiliate_code ?? null;
  }

  const row = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    status,
    current_period_end: periodEnd,
    updated_at: new Date().toISOString(),
  };
  if (code) row.affiliate_code = code;

  const { error } = await supabaseAdmin.from('user_subscriptions').upsert(row);
  if (error) throw new Error(error.message);
}

export function isActiveProStatus(status) {
  return status === 'active' || status === 'trialing';
}

export function normalizeAffiliateCode(raw) {
  const code = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
  return /^[A-Z0-9_-]{3,32}$/.test(code) ? code : null;
}

export async function getAffiliateByCode(code) {
  if (!supabaseAdmin) return null;
  const normalized = normalizeAffiliateCode(code);
  if (!normalized) return null;
  const { data, error } = await supabaseAdmin
    .from('affiliates')
    .select('code, display_name, commission_rate, active')
    .eq('code', normalized)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.active) return null;
  return data;
}
