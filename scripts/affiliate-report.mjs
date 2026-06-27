/**
 * Informe de comisiones de referidos (ejecutar en local con .env configurado)
 * npm run report:affiliates
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const url = process.env.VITE_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const PRO_PRICE_EUR = 1.99;

if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const ACTIVE = new Set(['active', 'trialing']);

const { data: affiliates, error: affErr } = await db
  .from('affiliates')
  .select('code, display_name, commission_rate, contact_email, active')
  .order('code');

if (affErr) {
  console.error('Error leyendo affiliates:', affErr.message);
  console.error('¿Ejecutaste supabase/schema-referrals.sql en Supabase?');
  process.exit(1);
}

const { data: subs, error: subErr } = await db
  .from('user_subscriptions')
  .select('affiliate_code, status')
  .not('affiliate_code', 'is', null);

if (subErr) {
  console.error('Error leyendo suscripciones:', subErr.message);
  process.exit(1);
}

console.log('\nLegends Tracker — informe de referidos\n');
console.log(`Precio Pro: ${PRO_PRICE_EUR} €/mes\n`);

for (const aff of affiliates || []) {
  const activeCount = (subs || []).filter(
    (s) => s.affiliate_code === aff.code && ACTIVE.has(s.status),
  ).length;
  const totalReferred = (subs || []).filter((s) => s.affiliate_code === aff.code).length;
  const rate = Number(aff.commission_rate) || 0.1;
  const commissionPerSub = PRO_PRICE_EUR * rate;
  const monthlyTotal = activeCount * commissionPerSub;

  console.log(`── ${aff.code} (${aff.display_name}) ${aff.active ? '' : '[INACTIVO]'}`);
  if (aff.contact_email) console.log(`   Email: ${aff.contact_email}`);
  console.log(`   Comisión: ${(rate * 100).toFixed(0)}% (${commissionPerSub.toFixed(2)} €/suscriptor/mes)`);
  console.log(`   Activos: ${activeCount} · Total referidos: ${totalReferred}`);
  console.log(`   A pagar este mes (estimado): ${monthlyTotal.toFixed(2)} €\n`);
}

const unassignedActive = (subs || []).filter(
  (s) => ACTIVE.has(s.status) && !s.affiliate_code,
).length;
if (unassignedActive) {
  console.log(`Suscripciones Pro activas sin código: ${unassignedActive}`);
}

console.log('Pagos manuales (Bizum/PayPal/transferencia) según este informe.\n');
