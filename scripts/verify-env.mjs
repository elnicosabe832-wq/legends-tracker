import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('No se encontró .env en la raíz del proyecto.');
    process.exit(1);
  }

  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      console.warn(`⚠️  Línea sin "=" (debe ser NOMBRE=valor): ${trimmed.slice(0, 40)}...`);
      continue;
    }
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

function mask(value) {
  if (!value) return '(vacío)';
  if (value.length <= 12) return '***';
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const keyName = env.VITE_SUPABASE_PUBLISHABLE_KEY
  ? 'VITE_SUPABASE_PUBLISHABLE_KEY'
  : env.VITE_SUPABASE_ANON_KEY
    ? 'VITE_SUPABASE_ANON_KEY'
    : null;

console.log('Legends Tracker — verificación de .env\n');
console.log(`OPENAI_API_KEY: ${env.OPENAI_API_KEY ? `✓ ${mask(env.OPENAI_API_KEY)}` : '✗ falta'}`);
console.log(`VITE_SUPABASE_URL: ${url ? `✓ ${url}` : '✗ falta'}`);
console.log(`Clave Supabase: ${keyName ? `✓ ${keyName} ${mask(key)}` : '✗ falta (anon o publishable)'}`);

if (!url || !key) {
  console.log('\nConfigura Supabase en .env y vuelve a ejecutar: npm run verify:env');
  process.exit(1);
}

if (key.startsWith('sb_publishable_')) {
  console.log('Tipo: publishable (nuevo formato Supabase)');
} else if (key.startsWith('eyJ')) {
  console.log('Tipo: anon JWT (legacy)');
} else {
  console.warn('⚠️  La clave no parece anon (eyJ...) ni publishable (sb_publishable_...)');
}

const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key } });
const body = await res.json().catch(() => ({}));

if (res.ok) {
  console.log('\n✓ Supabase responde correctamente. El login debería funcionar.');
  process.exit(0);
}

console.log(`\n✗ Supabase rechazó la clave: ${body.message || res.status}`);
if (body.hint) console.log(`  Hint: ${body.hint}`);
console.log('\nQué hacer:');
console.log('1. Supabase Dashboard → Settings → API');
console.log('2. Pestaña "API Keys" → copia Publishable key → VITE_SUPABASE_PUBLISHABLE_KEY=...');
console.log('   O pestaña "Legacy API Keys" → anon public → VITE_SUPABASE_ANON_KEY=...');
console.log('3. Copia la clave COMPLETA en una sola línea (NOMBRE=valor)');
console.log('4. Reinicia: npm run dev');
process.exit(1);
