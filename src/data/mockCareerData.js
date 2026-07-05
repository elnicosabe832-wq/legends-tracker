/**
 * Mock data — Real Betis · 5 temporadas (generado por scripts/generate-mock-career.mjs).
 * Temporada 1: stats exactas de capturas del save. T2–T5: simulación con fichajes reales.
 */

export const MOCK_TEAM_NAME = 'Real Betis Balompié';

/** @type {Record<string, Array<{ id: string, name: string, pos: string, matches: number, goals: number, assists: number, cleanSheets: number }>>} */
export const MOCK_CAREER_BY_SEASON = {
  "1": [
    {
      "id": "betis-cucho",
      "name": "Cucho",
      "pos": "DC",
      "matches": 51,
      "goals": 22,
      "assists": 7,
      "cleanSheets": 0
    },
    {
      "id": "betis-carvalho",
      "name": "W. Carvalho",
      "pos": "MCD",
      "matches": 51,
      "goals": 6,
      "assists": 7,
      "cleanSheets": 0
    },
    {
      "id": "betis-antony",
      "name": "Antony",
      "pos": "MD",
      "matches": 48,
      "goals": 11,
      "assists": 3,
      "cleanSheets": 0
    },
    {
      "id": "betis-isco",
      "name": "Isco",
      "pos": "MCO",
      "matches": 43,
      "goals": 8,
      "assists": 13,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-locelso",
      "name": "G. Lo Celso",
      "pos": "MCO",
      "matches": 38,
      "goals": 12,
      "assists": 4,
      "cleanSheets": 0
    },
    {
      "id": "betis-juanmi",
      "name": "Juanmi",
      "pos": "MI",
      "matches": 40,
      "goals": 7,
      "assists": 2,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-llorente",
      "name": "D. Llorente",
      "pos": "DFC",
      "matches": 32,
      "goals": 2,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-fornals",
      "name": "P. Fornals",
      "pos": "MD",
      "matches": 32,
      "goals": 3,
      "assists": 2,
      "cleanSheets": 0
    },
    {
      "id": "betis-bartra",
      "name": "M. Bartra",
      "pos": "DFC",
      "matches": 28,
      "goals": 1,
      "assists": 1,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-losada",
      "name": "I. Losada",
      "pos": "MCO",
      "matches": 23,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-altimira",
      "name": "S. Altimira",
      "pos": "MCD",
      "matches": 16,
      "goals": 0,
      "assists": 3,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-roca",
      "name": "M. Roca",
      "pos": "MCD",
      "matches": 16,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-avila",
      "name": "E. Ávila",
      "pos": "DC",
      "matches": 9,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-flores",
      "name": "M. Flores",
      "pos": "MCD",
      "matches": 5,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-pleguezuelo",
      "name": "X. Pleguezuelo",
      "pos": "LI",
      "matches": 4,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-adrian",
      "name": "Adrián",
      "pos": "POR",
      "matches": 42,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 12,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-vieites",
      "name": "F. Vieites",
      "pos": "POR",
      "matches": 7,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 1
    },
    {
      "id": "betis-silva",
      "name": "R. Silva",
      "pos": "POR",
      "matches": 2,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    }
  ],
  "2": [
    {
      "id": "betis-cucho",
      "name": "Cucho",
      "pos": "DC",
      "matches": 54,
      "goals": 25,
      "assists": 8,
      "cleanSheets": 0
    },
    {
      "id": "betis-locelso",
      "name": "G. Lo Celso",
      "pos": "MCO",
      "matches": 33,
      "goals": 11,
      "assists": 4,
      "cleanSheets": 0
    },
    {
      "id": "betis-antony",
      "name": "Antony",
      "pos": "MD",
      "matches": 42,
      "goals": 10,
      "assists": 3,
      "cleanSheets": 0
    },
    {
      "id": "betis-vitinho",
      "name": "Vitinho",
      "pos": "DC",
      "matches": 28,
      "goals": 8,
      "assists": 4,
      "cleanSheets": 0
    },
    {
      "id": "betis-isco",
      "name": "Isco",
      "pos": "MCO",
      "matches": 37,
      "goals": 7,
      "assists": 11,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-juanmi",
      "name": "Juanmi",
      "pos": "MI",
      "matches": 35,
      "goals": 6,
      "assists": 2,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-ceballos",
      "name": "Dani Ceballos",
      "pos": "MC",
      "matches": 39,
      "goals": 4,
      "assists": 9,
      "cleanSheets": 0
    },
    {
      "id": "betis-fornals",
      "name": "P. Fornals",
      "pos": "MD",
      "matches": 36,
      "goals": 3,
      "assists": 2,
      "cleanSheets": 0
    },
    {
      "id": "betis-llorente",
      "name": "D. Llorente",
      "pos": "DFC",
      "matches": 36,
      "goals": 2,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-bade",
      "name": "Loïc Badé",
      "pos": "DFC",
      "matches": 34,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-bartra",
      "name": "M. Bartra",
      "pos": "DFC",
      "matches": 31,
      "goals": 1,
      "assists": 1,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-avila",
      "name": "E. Ávila",
      "pos": "DC",
      "matches": 8,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-flores",
      "name": "M. Flores",
      "pos": "MCD",
      "matches": 8,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-losada",
      "name": "I. Losada",
      "pos": "MCO",
      "matches": 26,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-altimira",
      "name": "S. Altimira",
      "pos": "MCD",
      "matches": 18,
      "goals": 0,
      "assists": 3,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-roca",
      "name": "M. Roca",
      "pos": "MCD",
      "matches": 18,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-pleguezuelo",
      "name": "X. Pleguezuelo",
      "pos": "LI",
      "matches": 8,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-vieites",
      "name": "F. Vieites",
      "pos": "POR",
      "matches": 6,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 1
    },
    {
      "id": "betis-silva",
      "name": "R. Silva",
      "pos": "POR",
      "matches": 5,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    }
  ],
  "3": [
    {
      "id": "betis-cucho",
      "name": "Cucho",
      "pos": "DC",
      "matches": 47,
      "goals": 22,
      "assists": 7,
      "cleanSheets": 0
    },
    {
      "id": "betis-locelso",
      "name": "G. Lo Celso",
      "pos": "MCO",
      "matches": 29,
      "goals": 10,
      "assists": 4,
      "cleanSheets": 0
    },
    {
      "id": "betis-isco",
      "name": "Isco",
      "pos": "MCO",
      "matches": 42,
      "goals": 8,
      "assists": 13,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-vitinho",
      "name": "Vitinho",
      "pos": "DC",
      "matches": 25,
      "goals": 7,
      "assists": 4,
      "cleanSheets": 0
    },
    {
      "id": "betis-ceballos",
      "name": "Dani Ceballos",
      "pos": "MC",
      "matches": 45,
      "goals": 5,
      "assists": 10,
      "cleanSheets": 0
    },
    {
      "id": "betis-fornals",
      "name": "P. Fornals",
      "pos": "MD",
      "matches": 32,
      "goals": 3,
      "assists": 2,
      "cleanSheets": 0
    },
    {
      "id": "betis-llorente",
      "name": "D. Llorente",
      "pos": "DFC",
      "matches": 31,
      "goals": 2,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-bartra",
      "name": "M. Bartra",
      "pos": "DFC",
      "matches": 35,
      "goals": 1,
      "assists": 1,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-bade",
      "name": "Loïc Badé",
      "pos": "DFC",
      "matches": 30,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-canas",
      "name": "J. Cañas",
      "pos": "MCO",
      "matches": 11,
      "goals": 1,
      "assists": 2,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-avila",
      "name": "E. Ávila",
      "pos": "DC",
      "matches": 9,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-flores",
      "name": "M. Flores",
      "pos": "MCD",
      "matches": 9,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-valles",
      "name": "Á. Valles",
      "pos": "POR",
      "matches": 38,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 14
    },
    {
      "id": "betis-losada",
      "name": "I. Losada",
      "pos": "MCO",
      "matches": 29,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-altimira",
      "name": "S. Altimira",
      "pos": "MCD",
      "matches": 16,
      "goals": 0,
      "assists": 3,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-roca",
      "name": "M. Roca",
      "pos": "MCD",
      "matches": 15,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-pleguezuelo",
      "name": "X. Pleguezuelo",
      "pos": "LI",
      "matches": 8,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-vieites",
      "name": "F. Vieites",
      "pos": "POR",
      "matches": 5,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 1
    },
    {
      "id": "betis-silva",
      "name": "R. Silva",
      "pos": "POR",
      "matches": 5,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    }
  ],
  "4": [
    {
      "id": "betis-cucho",
      "name": "Cucho",
      "pos": "DC",
      "matches": 54,
      "goals": 25,
      "assists": 8,
      "cleanSheets": 0
    },
    {
      "id": "betis-vitinho",
      "name": "Vitinho",
      "pos": "DC",
      "matches": 28,
      "goals": 8,
      "assists": 4,
      "cleanSheets": 0
    },
    {
      "id": "betis-isco",
      "name": "Isco",
      "pos": "MCO",
      "matches": 36,
      "goals": 7,
      "assists": 11,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-fabian",
      "name": "Fabián Ruiz",
      "pos": "MCO",
      "matches": 36,
      "goals": 6,
      "assists": 11,
      "cleanSheets": 0
    },
    {
      "id": "betis-ceballos",
      "name": "Dani Ceballos",
      "pos": "MC",
      "matches": 39,
      "goals": 4,
      "assists": 9,
      "cleanSheets": 0
    },
    {
      "id": "betis-llorente",
      "name": "D. Llorente",
      "pos": "DFC",
      "matches": 28,
      "goals": 2,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-bartra",
      "name": "M. Bartra",
      "pos": "DFC",
      "matches": 31,
      "goals": 1,
      "assists": 1,
      "cleanSheets": 0,
      "ageGroup": "veteran"
    },
    {
      "id": "betis-bade",
      "name": "Loïc Badé",
      "pos": "DFC",
      "matches": 27,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-canas",
      "name": "J. Cañas",
      "pos": "MCO",
      "matches": 13,
      "goals": 1,
      "assists": 2,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-avila",
      "name": "E. Ávila",
      "pos": "DC",
      "matches": 10,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-flores",
      "name": "M. Flores",
      "pos": "MCD",
      "matches": 8,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-valles",
      "name": "Á. Valles",
      "pos": "POR",
      "matches": 34,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 13
    },
    {
      "id": "betis-losada",
      "name": "I. Losada",
      "pos": "MCO",
      "matches": 32,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-roca",
      "name": "M. Roca",
      "pos": "MCD",
      "matches": 17,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-altimira",
      "name": "S. Altimira",
      "pos": "MCD",
      "matches": 14,
      "goals": 0,
      "assists": 3,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-pleguezuelo",
      "name": "X. Pleguezuelo",
      "pos": "LI",
      "matches": 9,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-vieites",
      "name": "F. Vieites",
      "pos": "POR",
      "matches": 5,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 1
    },
    {
      "id": "betis-silva",
      "name": "R. Silva",
      "pos": "POR",
      "matches": 5,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    }
  ],
  "5": [
    {
      "id": "betis-cucho",
      "name": "Cucho",
      "pos": "DC",
      "matches": 47,
      "goals": 22,
      "assists": 7,
      "cleanSheets": 0
    },
    {
      "id": "betis-vitinho",
      "name": "Vitinho",
      "pos": "DC",
      "matches": 25,
      "goals": 7,
      "assists": 4,
      "cleanSheets": 0
    },
    {
      "id": "betis-ceballos",
      "name": "Dani Ceballos",
      "pos": "MC",
      "matches": 44,
      "goals": 5,
      "assists": 10,
      "cleanSheets": 0
    },
    {
      "id": "betis-fabian",
      "name": "Fabián Ruiz",
      "pos": "MCO",
      "matches": 31,
      "goals": 5,
      "assists": 9,
      "cleanSheets": 0
    },
    {
      "id": "betis-llorente",
      "name": "D. Llorente",
      "pos": "DFC",
      "matches": 31,
      "goals": 2,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-bade",
      "name": "Loïc Badé",
      "pos": "DFC",
      "matches": 31,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-canas",
      "name": "J. Cañas",
      "pos": "MCO",
      "matches": 12,
      "goals": 1,
      "assists": 2,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-avila",
      "name": "E. Ávila",
      "pos": "DC",
      "matches": 11,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-flores",
      "name": "M. Flores",
      "pos": "MCD",
      "matches": 9,
      "goals": 1,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-valles",
      "name": "Á. Valles",
      "pos": "POR",
      "matches": 30,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 12
    },
    {
      "id": "betis-losada",
      "name": "I. Losada",
      "pos": "MCO",
      "matches": 28,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-roca",
      "name": "M. Roca",
      "pos": "MCD",
      "matches": 19,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-altimira",
      "name": "S. Altimira",
      "pos": "MCD",
      "matches": 12,
      "goals": 0,
      "assists": 3,
      "cleanSheets": 0,
      "ageGroup": "young"
    },
    {
      "id": "betis-pleguezuelo",
      "name": "X. Pleguezuelo",
      "pos": "LI",
      "matches": 8,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    },
    {
      "id": "betis-vieites",
      "name": "F. Vieites",
      "pos": "POR",
      "matches": 5,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 1
    },
    {
      "id": "betis-silva",
      "name": "R. Silva",
      "pos": "POR",
      "matches": 5,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0
    }
  ]
};

export const MOCK_HALL_OF_FAME = [
  {
    "id": "hof-betis-isco",
    "status": "retired",
    "isLegend": true,
    "enshrinedAt": "2026-06-15T12:00:00.000Z",
    "reason": "Retirado en el club tras cinco temporadas de magia",
    "badges": [
      "⚽ 30+ goles históricos",
      "🎯 Rey de asistencias",
      "🛡️ 100+ partidos"
    ],
    "snapshot": {
      "name": "Isco",
      "pos": "MCO",
      "matches": 158,
      "goals": 30,
      "assists": 48,
      "cleanSheets": 0,
      "seasonsPlayed": 4
    }
  },
  {
    "id": "hof-betis-bartra",
    "status": "retired",
    "isLegend": true,
    "enshrinedAt": "2027-06-15T12:00:00.000Z",
    "reason": "Retirada / muro defensivo histórico",
    "badges": [
      "🛡️ 100+ partidos"
    ],
    "snapshot": {
      "name": "M. Bartra",
      "pos": "DFC",
      "matches": 125,
      "goals": 4,
      "assists": 4,
      "cleanSheets": 0,
      "seasonsPlayed": 4
    }
  }
];

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
