import { generateChronicle, normalizeSeasonLabels } from '../utils/seasonUtils';
import { getMockSeasonRosters, MOCK_HALL_OF_FAME, MOCK_TEAM_NAME } from './mockCareerData';
import { PLAYER_ORIGIN } from '../utils/playerProfileUtils';

export const DEMO_CAREER_ID = 'demo-career';

const DEMO_PROFILES = {
  Cucho: { age: 26, origin: PLAYER_ORIGIN.signing, transferFee: 12_000_000, saleFee: null },
  Antony: { age: 25, origin: PLAYER_ORIGIN.signing, transferFee: 22_000_000, saleFee: 18_000_000 },
  Isco: { age: 33, origin: PLAYER_ORIGIN.signing, transferFee: 0, saleFee: null },
  'M. Flores': { age: 20, origin: PLAYER_ORIGIN.academy, transferFee: null, saleFee: null },
  'I. Losada': { age: 19, origin: PLAYER_ORIGIN.academy, transferFee: null, saleFee: null },
  'S. Altimira': { age: 22, origin: PLAYER_ORIGIN.academy, transferFee: null, saleFee: null },
  'Dani Ceballos': { age: 28, origin: PLAYER_ORIGIN.signing, transferFee: 8_000_000, saleFee: null },
  'Loïc Badé': { age: 25, origin: PLAYER_ORIGIN.signing, transferFee: 15_000_000, saleFee: null },
  Vitinho: { age: 24, origin: PLAYER_ORIGIN.signing, transferFee: 9_000_000, saleFee: null },
  'W. Carvalho': { age: 32, origin: PLAYER_ORIGIN.signing, transferFee: 16_000_000, saleFee: 6_000_000 },
};

export function buildDemoCareer() {
  const teamName = MOCK_TEAM_NAME;
  const rosters = getMockSeasonRosters();
  const playerProfiles = DEMO_PROFILES;

  const seasons = normalizeSeasonLabels(
    rosters.map((players, i) => ({
      id: `s${i + 1}`,
      label: `Temporada ${i + 1}`,
      players: players.map((p) => ({ ...p })),
      chronicle: generateChronicle(players, teamName, playerProfiles),
    })),
  );

  return {
    id: DEMO_CAREER_ID,
    name: teamName,
    subtitle: 'Carrera de ejemplo · Modo Manager · 5 temporadas',
    isDemo: true,
    seasons,
    linkedClub: 'Real Betis',
    realLife: [],
    hallOfFame: MOCK_HALL_OF_FAME.map((entry) => ({ ...entry })),
    playerProfiles,
    challenges: {
      active: [
        {
          challengeId: 'goleador-30',
          progress: 28,
          status: 'active',
          activatedAt: '2025-05-01T12:00:00.000Z',
        },
      ],
    },
  };
}
