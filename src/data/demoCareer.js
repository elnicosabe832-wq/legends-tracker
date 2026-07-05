import { generateChronicle, normalizeSeasonLabels } from '../utils/seasonUtils';

export const DEMO_CAREER_ID = 'demo-career';

const SEASON_ROSTERS = [
  [
    { name: 'I. Williams', pos: 'EI', matches: 34, goals: 12, assists: 7, cleanSheets: 0 },
    { name: 'Sancet', pos: 'MCO', matches: 36, goals: 9, assists: 11, cleanSheets: 0 },
    { name: 'Guruzeta', pos: 'DC', matches: 32, goals: 15, assists: 3, cleanSheets: 0 },
    { name: 'Yeray', pos: 'DFC', matches: 35, goals: 2, assists: 1, cleanSheets: 0 },
    { name: 'Unai Simón', pos: 'POR', matches: 38, goals: 0, assists: 0, cleanSheets: 14 },
  ],
  [
    { name: 'I. Williams', pos: 'EI', matches: 37, goals: 18, assists: 9, cleanSheets: 0 },
    { name: 'Sancet', pos: 'MCO', matches: 38, goals: 14, assists: 8, cleanSheets: 0 },
    { name: 'Guruzeta', pos: 'DC', matches: 35, goals: 19, assists: 4, cleanSheets: 0 },
    { name: 'Yeray', pos: 'DFC', matches: 36, goals: 3, assists: 2, cleanSheets: 0 },
    { name: 'Unai Simón', pos: 'POR', matches: 40, goals: 0, assists: 0, cleanSheets: 16 },
    { name: 'Vesga', pos: 'MCD', matches: 30, goals: 4, assists: 5, cleanSheets: 0 },
  ],
  [
    { name: 'I. Williams', pos: 'EI', matches: 39, goals: 22, assists: 10, cleanSheets: 0 },
    { name: 'Sancet', pos: 'MCO', matches: 40, goals: 16, assists: 12, cleanSheets: 0 },
    { name: 'Guruzeta', pos: 'DC', matches: 38, goals: 21, assists: 5, cleanSheets: 0 },
    { name: 'Yeray', pos: 'DFC', matches: 34, goals: 1, assists: 0, cleanSheets: 0 },
    { name: 'Unai Simón', pos: 'POR', matches: 42, goals: 0, assists: 0, cleanSheets: 18 },
    { name: 'Vesga', pos: 'MCD', matches: 33, goals: 5, assists: 6, cleanSheets: 0 },
  ],
  [
    { name: 'I. Williams', pos: 'EI', matches: 41, goals: 25, assists: 11, cleanSheets: 0 },
    { name: 'Sancet', pos: 'MCO', matches: 39, goals: 19, assists: 14, cleanSheets: 0 },
    { name: 'Guruzeta', pos: 'DC', matches: 40, goals: 24, assists: 6, cleanSheets: 0 },
    { name: 'Unai Simón', pos: 'POR', matches: 44, goals: 0, assists: 0, cleanSheets: 20 },
    { name: 'Berenguer', pos: 'ED', matches: 36, goals: 11, assists: 8, cleanSheets: 0 },
  ],
  [
    { name: 'I. Williams', pos: 'EI', matches: 43, goals: 28, assists: 13, cleanSheets: 0 },
    { name: 'Sancet', pos: 'MCO', matches: 42, goals: 22, assists: 15, cleanSheets: 0 },
    { name: 'Guruzeta', pos: 'DC', matches: 41, goals: 26, assists: 7, cleanSheets: 0 },
    { name: 'Unai Simón', pos: 'POR', matches: 45, goals: 0, assists: 0, cleanSheets: 22 },
    { name: 'Berenguer', pos: 'ED', matches: 38, goals: 14, assists: 9, cleanSheets: 0 },
  ],
];

export function buildDemoCareer() {
  const teamName = 'Athletic Club';
  const seasons = normalizeSeasonLabels(
    SEASON_ROSTERS.map((players, i) => ({
      id: `s${i + 1}`,
      label: `Temporada ${i + 1}`,
      players: players.map((p) => ({ ...p })),
      chronicle: generateChronicle(players, teamName),
    })),
  );

  return {
    id: DEMO_CAREER_ID,
    name: teamName,
    subtitle: 'Carrera de ejemplo · Modo Manager',
    isDemo: true,
    seasons,
    linkedClub: null,
    realLife: [],
    hallOfFame: [
      {
        id: 'hof-demo-yeray',
        enshrinedAt: '2025-06-01T12:00:00.000Z',
        reason: 'Retirada / leyenda defensiva',
        badges: ['🛡️ Muro del club', '100+ partidos'],
        snapshot: {
          name: 'Yeray',
          pos: 'DFC',
          matches: 105,
          goals: 6,
          assists: 3,
          cleanSheets: 0,
          seasonsPlayed: 3,
        },
      },
    ],
  };
}
