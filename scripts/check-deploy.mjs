const WEB = 'https://legends-tracker-five.vercel.app';
const API = 'https://legends-tracker.onrender.com';

async function check(name, fn) {
  try {
    const ok = await fn();
    console.log(ok ? `✓ ${name}` : `✗ ${name}`);
    return ok;
  } catch (err) {
    console.log(`✗ ${name}: ${err.message}`);
    return false;
  }
}

console.log('Legends Tracker — comprobación online\n');

await check('Web Vercel responde', async () => {
  const res = await fetch(WEB);
  return res.ok;
});

await check('API Render health', async () => {
  const res = await fetch(`${API}/api/health`);
  const data = await res.json();
  return data.ok && data.hasApiKey && data.stripe && data.supabaseAdmin;
});

await check('CORS Vercel → Render', async () => {
  const res = await fetch(`${API}/api/health`, {
    headers: { Origin: WEB },
  });
  const acao = res.headers.get('access-control-allow-origin');
  return res.ok && (acao === WEB || acao === '*');
});

let jsUrl = '';
await check('VITE_API_URL en build Vercel', async () => {
  const html = await (await fetch(WEB)).text();
  const m = html.match(/assets\/(index-[^"]+\.js)/);
  if (!m) return false;
  jsUrl = `${WEB}/assets/${m[1]}`;
  const js = await (await fetch(jsUrl)).text();
  return js.includes('legends-tracker.onrender.com');
});

console.log('\nURLs:');
console.log(`  Web:  ${WEB}`);
console.log(`  API:  ${API}`);
