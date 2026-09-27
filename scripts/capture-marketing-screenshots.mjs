/**
 * Captura screenshots reales de la app para marketing (Reddit, etc.)
 * Uso: npm run build && npm run screenshots
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
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error(`Server not ready at ${url}`);
}

function startPreview() {
  return spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
    cwd: ROOT,
    shell: true,
    stdio: 'ignore',
  });
}

async function shot(page, name, opts = {}) {
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, type: 'png', ...opts });
  console.log(`  ✓ ${name}`);
}

async function openMuroTab(page, pattern) {
  const tab = page.locator('.muro-tab').filter({ hasText: pattern }).first();
  await tab.scrollIntoViewIfNeeded();
  await tab.click({ timeout: 15000 });
  await sleep(800);
}

async function loadDemo(page) {
  await page.goto(`${BASE}/${MARKETING}`, { waitUntil: 'networkidle' });
  const demoBtn = page.getByRole('button', { name: /ejemplo|demo|example/i });
  await demoBtn.click({ timeout: 15000 });
  await sleep(800);
}

async function scrollToSelector(page, selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded({ timeout: 10000 });
  await sleep(400);
}

async function captureRemaining() {
  await mkdir(OUT_DIR, { recursive: true });

  const preview = startPreview();
  try {
    await waitForServer(BASE);
    console.log('Capturando screenshots…');

    const browser = await chromium.launch();
    const ctx = await browser.newContext({
      locale: 'es-ES',
      colorScheme: 'dark',
    });

    // ── Mobile 1:1 (Reddit feed) ──
    const mobile = await ctx.newPage();
    await mobile.setViewportSize({ width: 390, height: 844 });

    await loadDemo(mobile);
    await mobile.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(1200);
    await shot(mobile, 'mobile-01-muro-rankings.png', { fullPage: false });

    await scrollToSelector(mobile, '.club-performance-chart');
    await shot(mobile, 'mobile-02-graficas-club.png', { fullPage: false });

    await scrollToSelector(mobile, '.performance-chart:not(.club-performance-chart)');
    await shot(mobile, 'mobile-03-grafica-jugador.png', { fullPage: false });

    const playerBtn = mobile.locator('.active-squad-player-btn').first();
    if (await playerBtn.count()) {
      await playerBtn.click();
      await sleep(600);
      await shot(mobile, 'mobile-04-jugador-stats.png', { fullPage: false });
      await mobile.keyboard.press('Escape');
      await sleep(300);
    }

    await mobile.goto(`${BASE}/periodico${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(800);
    await shot(mobile, 'mobile-05-periodico.png', { fullPage: false });

    await mobile.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(600);
    await mobile.locator('.muro-tab').nth(2).click();
    await sleep(1000);
    await shot(mobile, 'mobile-06-historia-real.png', { fullPage: false });

    await mobile.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(400);
    await mobile.locator('.muro-tab').nth(1).click();
    await sleep(800);
    await shot(mobile, 'mobile-07-salon-fama.png', { fullPage: false });

    await mobile.goto(`${BASE}/retos${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(600);
    await shot(mobile, 'mobile-08-retos.png', { fullPage: false });

    // ── Desktop remaining + square ──
    const desktop = await ctx.newPage();
    await desktop.setViewportSize({ width: 1440, height: 900 });

    await loadDemo(desktop);
    await desktop.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(1200);
    await shot(desktop, 'desktop-01-muro-completo.png', { fullPage: true });

    await desktop.goto(`${BASE}/periodico${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(800);
    await shot(desktop, 'desktop-02-periodico.png', { fullPage: true });

    await desktop.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(800);
    await desktop.locator('.muro-tab').nth(2).click({ timeout: 10000 });
    await sleep(1000);
    await shot(desktop, 'desktop-03-historia-real.png', { fullPage: true });

    await desktop.locator('.muro-tab').nth(1).click({ timeout: 10000 });
    await sleep(800);
    await shot(desktop, 'desktop-04-salon-fama.png', { fullPage: true });

    // ── Square crops 1200x1200 for Reddit ──
    const square = await ctx.newPage();
    await square.setViewportSize({ width: 1200, height: 1200 });

    await loadDemo(square);
    await square.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(1200);
    await scrollToSelector(square, '.club-performance-chart');
    await shot(square, 'reddit-01-graficas-club-1200.png');

    await scrollToSelector(square, '.performance-chart:not(.club-performance-chart)');
    await shot(square, 'reddit-02-grafica-jugador-1200.png');

    await square.locator('.active-squad-player-btn').first().click();
    await sleep(600);
    await shot(square, 'reddit-03-jugador-modal-1200.png');

    await square.goto(`${BASE}/periodico${MARKETING}`, { waitUntil: 'networkidle' });
    await sleep(800);
    await shot(square, 'reddit-04-periodico-1200.png');

    await browser.close();
    console.log(`\nListo → ${OUT_DIR}`);
  } finally {
    preview.kill('SIGTERM');
  }
}

async function main() {
  await captureRemaining();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
