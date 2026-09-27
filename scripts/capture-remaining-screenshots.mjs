/**
 * Captura solo las imágenes que faltan (desktop historia + cuadrados Reddit).
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'marketing', 'screenshots');
const BASE = process.env.SCREENSHOT_BASE || 'http://127.0.0.1:4173';
const MARKETING = '?marketing=1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch { /* retry */ }
    await sleep(500);
  }
  throw new Error(`Server not ready at ${url}`);
}

function startPreview() {
  return spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
    cwd: ROOT,
    shell: true,
    stdio: 'ignore',
  });
}

async function shot(page, name, opts = {}) {
  await page.screenshot({ path: path.join(OUT_DIR, name), type: 'png', ...opts });
  console.log(`  ✓ ${name}`);
}

async function loadDemo(page) {
  await page.goto(`${BASE}/${MARKETING}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /ejemplo|demo|example/i }).click({ timeout: 15000 });
  await sleep(1000);
  await page.waitForSelector('.nav, nav, .header', { timeout: 10000 }).catch(() => {});
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const preview = startPreview();
  try {
    await waitForServer(BASE);
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ locale: 'es-ES', colorScheme: 'dark' });

    const desktop = await ctx.newPage();
    await desktop.setViewportSize({ width: 1440, height: 900 });
    await loadDemo(desktop);

    await desktop.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    const tabCount = await desktop.locator('.muro-tab').count();
    console.log(`muro-tabs: ${tabCount}`);
    if (tabCount < 3) {
      const html = await desktop.locator('.page').innerText().catch(() => 'no page');
      console.log('page text sample:', String(html).slice(0, 400));
    }
    await desktop.locator('.muro-tab').nth(2).click({ timeout: 15000 });
    await sleep(1200);
    await shot(desktop, 'desktop-03-historia-real.png', { fullPage: true });

    await desktop.locator('.muro-tab').nth(1).click({ timeout: 15000 });
    await sleep(800);
    await shot(desktop, 'desktop-04-salon-fama.png', { fullPage: true });

    const square = await ctx.newPage();
    await square.setViewportSize({ width: 1200, height: 1200 });
    await loadDemo(square);
    await square.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'domcontentloaded' });
    await sleep(1500);

    await square.locator('.club-performance-chart').first().scrollIntoViewIfNeeded();
    await sleep(500);
    await shot(square, 'reddit-01-graficas-club-1200.png');

    await square.locator('.performance-chart:not(.club-performance-chart)').first().scrollIntoViewIfNeeded();
    await sleep(500);
    await shot(square, 'reddit-02-grafica-jugador-1200.png');

    await square.locator('.active-squad-player-btn').first().click();
    await sleep(700);
    await shot(square, 'reddit-03-jugador-modal-1200.png');
    await square.keyboard.press('Escape');

    await square.goto(`${BASE}/periodico${MARKETING}`, { waitUntil: 'domcontentloaded' });
    await sleep(1000);
    await shot(square, 'reddit-04-periodico-1200.png');

    await square.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'domcontentloaded' });
    await sleep(1000);
    await square.locator('.rankings-grid').first().scrollIntoViewIfNeeded();
    await sleep(400);
    await shot(square, 'reddit-05-rankings-stats-1200.png');

    await browser.close();
    console.log(`\nListo → ${OUT_DIR}`);
  } finally {
    preview.kill('SIGTERM');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
