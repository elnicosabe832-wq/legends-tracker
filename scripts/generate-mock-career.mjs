/**
 * Genera mockCareerData.js — 5 temporadas Real Betis para la carrera demo.
 * Ejecutar: node scripts/generate-mock-career.mjs
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../src/data/mockCareerData.js');

/** @typedef {{ id: string, name: string, pos: string, matches: number, goals: number, assists: number, cleanSheets: number, ageGroup?: 'young'|'veteran'|'prime' }} PlayerRow */

/** Temporada 1 — datos exactos de las capturas del save. */
const SEASON_1 = [
  { id: 'betis-cucho', name: 'Cucho', pos: 'DC', matches: 51, goals: 22, assists: 7, cleanSheets: 0 },
  { id: 'betis-carvalho', name: 'W. Carvalho', pos: 'MCD', matches: 51, goals: 6, assists: 7, cleanSheets: 0 },
  { id: 'betis-antony', name: 'Antony', pos: 'MD', matches: 48, goals: 11, assists: 3, cleanSheets: 0 },
  { id: 'betis-isco', name: 'Isco', pos: 'MCO', matches: 43, goals: 8, assists: 13, cleanSheets: 0, ageGroup: 'veteran' },
  { id: 'betis-locelso', name: 'G. Lo Celso', pos: 'MCO', matches: 38, goals: 12, assists: 4, cleanSheets: 0 },
  { id: 'betis-juanmi', name: 'Juanmi', pos: 'MI', matches: 40, goals: 7, assists: 2, cleanSheets: 0, ageGroup: 'veteran' },
  { id: 'betis-llorente', name: 'D. Llorente', pos: 'DFC', matches: 32, goals: 2, assists: 0, cleanSheets: 0 },
  { id: 'betis-fornals', name: 'P. Fornals', pos: 'MD', matches: 32, goals: 3, assists: 2, cleanSheets: 0 },
  { id: 'betis-bartra', name: 'M. Bartra', pos: 'DFC', matches: 28, goals: 1, assists: 1, cleanSheets: 0, ageGroup: 'veteran' },
  { id: 'betis-losada', name: 'I. Losada', pos: 'MCO', matches: 23, goals: 0, assists: 0, cleanSheets: 0, ageGroup: 'young' },
  { id: 'betis-altimira', name: 'S. Altimira', pos: 'MCD', matches: 16, goals: 0, assists: 3, cleanSheets: 0, ageGroup: 'young' },
  { id: 'betis-roca', name: 'M. Roca', pos: 'MCD', matches: 16, goals: 0, assists: 0, cleanSheets: 0, ageGroup: 'young' },
  { id: 'betis-avila', name: 'E. Ávila', pos: 'DC', matches: 9, goals: 1, assists: 0, cleanSheets: 0, ageGroup: 'young' },
  { id: 'betis-flores', name: 'M. Flores', pos: 'MCD', matches: 5, goals: 1, assists: 0, cleanSheets: 0, ageGroup: 'young' },
  { id: 'betis-pleguezuelo', name: 'X. Pleguezuelo', pos: 'LI', matches: 4, goals: 0, assists: 0, cleanSheets: 0 },
  { id: 'betis-adrian', name: 'Adrián', pos: 'POR', matches: 42, goals: 0, assists: 0, cleanSheets: 12, ageGroup: 'veteran' },
  { id: 'betis-vieites', name: 'F. Vieites', pos: 'POR', matches: 7, goals: 0, assists: 0, cleanSheets: 1 },
  { id: 'betis-silva', name: 'R. Silva', pos: 'POR', matches: 2, goals: 0, assists: 0, cleanSheets: 0 },
];

/** Fichajes y bajas por temporada (a partir de T2). */
const TRANSFERS = {
  2: {
    in: [
      { id: 'betis-bade', name: 'Loïc Badé', pos: 'DFC', matches: 0, goals: 0, assists: 0, cleanSheets: 0 },
      { id: 'betis-ceballos', name: 'Dani Ceballos', pos: 'MC', matches: 0, goals: 0, assists: 0, cleanSheets: 0 },
      { id: 'betis-vitinho', name: 'Vitinho', pos: 'DC', matches: 0, goals: 0, assists: 0, cleanSheets: 0 },
    ],
    out: ['W. Carvalho', 'Adrián'],
  },
  3: {
    in: [
      { id: 'betis-valles', name: 'Á. Valles', pos: 'POR', matches: 0, goals: 0, assists: 0, cleanSheets: 0 },
      { id: 'betis-canas', name: 'J. Cañas', pos: 'MCO', matches: 0, goals: 0, assists: 0, cleanSheets: 0, ageGroup: 'young' },
    ],
    out: ['Antony', 'Juanmi'],
  },
  4: {
    in: [
      { id: 'betis-fabian', name: 'Fabián Ruiz', pos: 'MCO', matches: 0, goals: 0, assists: 0, cleanSheets: 0 },
    ],
    out: ['G. Lo Celso', 'P. Fornals'],
  },
  5: {
    in: [],
    out: ['Isco', 'M. Bartra'],
  },
};

/** PRNG determinista para reproducibilidad. */
function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260613);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function roundStat(n) {
  return Math.max(0, Math.round(n));
}

/**
 * Fluctúa stats ±10–15% respecto a la temporada anterior.
 * Jóvenes tienden a subir; veteranos bajan desde T3–T4.
 */
function evolvePlayer(prev, seasonNum) {
  const isGk = prev.pos === 'POR';
  let bias = 0;

  if (prev.ageGroup === 'young') {
    bias = seasonNum <= 3 ? 0.08 : 0.04;
  } else if (prev.ageGroup === 'veteran') {
    if (seasonNum >= 4) bias = -0.12;
    else if (seasonNum >= 3) bias = -0.07;
    else bias = -0.02;
  }

  const pct = 0.10 + rand() * 0.05;
  const sign = rand() + bias > 0.5 ? 1 : -1;
  const factor = 1 + sign * pct;

  const matches = roundStat(clamp(prev.matches * factor, isGk ? 5 : 8, isGk ? 46 : 54));
  const goals = roundStat(prev.goals * factor * (prev.ageGroup === 'young' && seasonNum <= 3 ? 1.15 : 1));
  const assists = roundStat(prev.assists * factor);
  let cleanSheets = prev.cleanSheets;

  if (isGk) {
    const csFactor = 1 + (rand() > 0.45 ? 0.12 : -0.1);
    cleanSheets = roundStat(clamp(prev.cleanSheets * csFactor, 0, matches));
    if (matches >= 30 && cleanSheets === 0) cleanSheets = Math.max(4, roundStat(matches * 0.22));
  }

  return {
    ...prev,
    matches,
    goals: isGk ? 0 : goals,
    assists: isGk ? 0 : assists,
    cleanSheets,
  };
}

/** Stats de llegada para fichajes nuevos. */
function bootstrapSigning(player, seasonNum) {
  const templates = {
    'Loïc Badé': { matches: 34, goals: 1, assists: 0, cleanSheets: 0 },
    'Dani Ceballos': { matches: 39, goals: 4, assists: 9, cleanSheets: 0 },
    Vitinho: { matches: 28, goals: 8, assists: 4, cleanSheets: 0 },
    'Á. Valles': { matches: 38, goals: 0, assists: 0, cleanSheets: 14 },
    'J. Cañas': { matches: 11, goals: 1, assists: 2, cleanSheets: 0 },
    'Fabián Ruiz': { matches: 36, goals: 6, assists: 11, cleanSheets: 0 },
  };
  const t = templates[player.name] || { matches: 20, goals: 2, assists: 2, cleanSheets: 0 };
  return { ...player, ...t };
}

function simulateSeasons() {
  const bySeason = { 1: SEASON_1.map((p) => ({ ...p })) };

  for (let s = 2; s <= 5; s += 1) {
    const prev = bySeason[s - 1];
    const { in: incoming, out: outgoing } = TRANSFERS[s];
    const outSet = new Set(outgoing);

    let roster = prev
      .filter((p) => !outSet.has(p.name))
      .map((p) => evolvePlayer(p, s));

    incoming.forEach((signing) => {
      roster.push(bootstrapSigning(signing, s));
    });

    roster.sort((a, b) => b.goals - a.goals || b.matches - a.matches);
    bySeason[s] = roster;
  }

  return bySeason;
}

function aggregateTotals(seasons) {
  const map = new Map();
  seasons.forEach((players) => {
    players.forEach((p) => {
      const cur = map.get(p.name) || { ...p, matches: 0, goals: 0, assists: 0, cleanSheets: 0 };
      cur.matches += p.matches;
      cur.goals += p.goals;
      cur.assists += p.assists;
      cur.cleanSheets += p.cleanSheets;
      cur.pos = p.pos;
      cur.id = p.id;
      map.set(p.name, cur);
    });
  });
  return map;
}

function countSeasonsPlayed(seasons, name) {
  return seasons.filter((pl) => pl.some((p) => p.name === name)).length;
}

function buildHallOfFame(allSeasons, retiredNames) {
  const flat = Object.values(allSeasons);
  const totals = aggregateTotals(flat);

  return retiredNames.map((name, i) => {
    const snap = totals.get(name);
    if (!snap) return null;
    const seasonsPlayed = countSeasonsPlayed(flat, name);
    const badges = [];
    if (snap.goals >= 30) badges.push('⚽ 30+ goles históricos');
    if (snap.assists >= 30) badges.push('🎯 Rey de asistencias');
    if (snap.matches >= 100) badges.push('🛡️ 100+ partidos');
    if (!badges.length) badges.push('⭐ Leyenda del club');

    return {
      id: `hof-${snap.id}`,
      status: 'retired',
      isLegend: true,
      enshrinedAt: `202${6 + i}-06-15T12:00:00.000Z`,
      reason: name === 'Isco' ? 'Retirado en el club tras cinco temporadas de magia' : 'Retirada / muro defensivo histórico',
      badges,
      snapshot: {
        name: snap.name,
        pos: snap.pos,
        matches: snap.matches,
        goals: snap.goals,
        assists: snap.assists,
        cleanSheets: snap.cleanSheets,
        seasonsPlayed,
      },
    };
  }).filter(Boolean);
}

const bySeason = simulateSeasons();
const seasonArrays = [1, 2, 3, 4, 5].map((n) => bySeason[n]);
const hallOfFame = buildHallOfFame(bySeason, ['Isco', 'M. Bartra']);

const file = `/**
 * Mock data — Real Betis · 5 temporadas (generado por scripts/generate-mock-career.mjs).
 * Temporada 1: stats exactas de capturas del save. T2–T5: simulación con fichajes reales.
 */

export const MOCK_TEAM_NAME = 'Real Betis Balompié';

/** @type {Record<string, Array<{ id: string, name: string, pos: string, matches: number, goals: number, assists: number, cleanSheets: number }>>} */
export const MOCK_CAREER_BY_SEASON = ${JSON.stringify(bySeason, null, 2)};

export const MOCK_HALL_OF_FAME = ${JSON.stringify(hallOfFame, null, 2)};

/** Devuelve array de plantillas ordenadas T1→T5 para buildDemoCareer. */
export function getMockSeasonRosters() {
  return [1, 2, 3, 4, 5].map((n) =>
    MOCK_CAREER_BY_SEASON[String(n)].map(({ id, name, pos, matches, goals, assists, cleanSheets }) => ({
      id,
      name,
      pos,
      matches,
      goals,
      assists,
      cleanSheets,
    })),
  );
}
`;

writeFileSync(OUT, file, 'utf8');
console.log('Written', OUT);
console.log('Season 5 roster:', bySeason[5].map((p) => p.name).join(', '));
console.log('HoF:', hallOfFame.map((h) => `${h.snapshot.name} (${h.snapshot.matches} PJ)`).join(', '));
