import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'marketing', 'screenshots');
const BASE = 'http://127.0.0.1:4173';
const MARKETING = '?marketing=1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch { /* */ }
    await sleep(500);
  }
  throw new Error('server not ready');
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, name), type: 'png' });
  console.log(`  ✓ ${name}`);
}

async function loadDemo(page) {
  await page.goto(`${BASE}/${MARKETING}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /ejemplo|demo|example/i }).click({ timeout: 15000 });
  await sleep(1200);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
    cwd: ROOT, shell: true, stdio: 'ignore',
  });
  try {
    await waitForServer(BASE);
    const browser = await chromium.launch();
    const page = await browser.newPage({ locale: 'es-ES', colorScheme: 'dark' });
    await page.setViewportSize({ width: 1200, height: 1200 });
    await loadDemo(page);

    await page.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    // Ensure Total histórico is selected
    const totalBtn = page.locator('.season-tab, .season-tabs button, button').filter({ hasText: /total|histórico|historic/i }).first();
    if (await totalBtn.count()) {
      await totalBtn.click().catch(() => {});
      await sleep(800);
    }

    await page.waitForSelector('.club-performance-chart, .performance-chart', { timeout: 20000 });
    await sleep(1000);

    const club = page.locator('.club-performance-chart').first();
    if (await club.count()) {
      await club.scrollIntoViewIfNeeded();
      await sleep(600);
      await shot(page, 'reddit-01-graficas-club-1200.png');
    } else {
      console.log('club chart missing, dumping selectors…');
      console.log(await page.locator('.page').innerText().then((t) => t.slice(0, 500)));
    }

    const playerChart = page.locator('.performance-chart').filter({ hasNot: page.locator('.club-chart-grid') }).last();
    await playerChart.scrollIntoViewIfNeeded();
    await sleep(500);
    await shot(page, 'reddit-02-grafica-jugador-1200.png');

    await page.locator('.active-squad-player-btn').first().scrollIntoViewIfNeeded();
    await page.locator('.active-squad-player-btn').first().click();
    await sleep(800);
    await shot(page, 'reddit-03-jugador-modal-1200.png');
    await page.keyboard.press('Escape');
    await sleep(300);

    await page.goto(`${BASE}/periodico${MARKETING}`, { waitUntil: 'domcontentloaded' });
    await sleep(1200);
    await shot(page, 'reddit-04-periodico-1200.png');

    await page.goto(`${BASE}/muro${MARKETING}`, { waitUntil: 'domcontentloaded' });
    await sleep(1500);
    if (await totalBtn.count()) await totalBtn.click().catch(() => {});
    await page.locator('.rankings-grid').first().scrollIntoViewIfNeeded();
    await sleep(500);
    await shot(page, 'reddit-05-rankings-stats-1200.png');

    await browser.close();
    console.log(`\nListo → ${OUT_DIR}`);
  } finally {
    preview.kill('SIGTERM');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
