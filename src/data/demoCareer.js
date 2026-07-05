import { generateChronicle, normalizeSeasonLabels } from '../utils/seasonUtils';
import { getMockSeasonRosters, MOCK_HALL_OF_FAME, MOCK_TEAM_NAME } from './mockCareerData';

export const DEMO_CAREER_ID = 'demo-career';

export function buildDemoCareer() {
  const teamName = MOCK_TEAM_NAME;
  const rosters = getMockSeasonRosters();

  const seasons = normalizeSeasonLabels(
    rosters.map((players, i) => ({
      id: `s${i + 1}`,
      label: `Temporada ${i + 1}`,
      players: players.map((p) => ({ ...p })),
      chronicle: generateChronicle(players, teamName),
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
