/**
 * Feed de retos de la comunidad.
 * Contenido traducible vía i18n (`retos.feed.posts.<contentKey>`).
 * En el futuro: cargar desde API / Supabase con el mismo shape.
 *
 * @typedef {'easy' | 'medium' | 'legend'} ChallengeDifficulty
 *
 * @typedef {Object} ChallengePost
 * @property {string} id
 * @property {string} contentKey - Clave bajo retos.feed.posts en i18n
 * @property {string} author
 * @property {string} team
 * @property {ChallengeDifficulty} difficulty
 * @property {number} likes - Contador base (admin / servidor)
 * @property {string} createdAt - ISO 8601
 */

/** @type {ChallengePost[]} */
export const COMMUNITY_CHALLENGE_POSTS = [
  {
    id: 'juve-rebuild-2526',
    contentKey: 'juve-rebuild-2526',
    author: 'Admin',
    team: 'Juventus',
    difficulty: 'legend',
    likes: 28,
    createdAt: '2026-06-08T10:00:00.000Z',
  },
  {
    id: 'betis-granada-ascenso',
    contentKey: 'betis-granada-ascenso',
    author: 'Admin',
    team: 'Real Betis Balompié',
    difficulty: 'medium',
    likes: 19,
    createdAt: '2026-06-05T14:30:00.000Z',
  },
  {
    id: 'leganes-salvador',
    contentKey: 'leganes-salvador',
    author: 'Admin',
    team: 'CD Leganés',
    difficulty: 'legend',
    likes: 34,
    createdAt: '2026-05-28T09:15:00.000Z',
  },
  {
    id: 'athletic-basque-only',
    contentKey: 'athletic-basque-only',
    author: 'Admin',
    team: 'Athletic Club',
    difficulty: 'medium',
    likes: 22,
    createdAt: '2026-05-20T16:00:00.000Z',
  },
  {
    id: 'roma-underdog-ucl',
    contentKey: 'roma-underdog-ucl',
    author: 'Admin',
    team: 'A.S. Roma',
    difficulty: 'legend',
    likes: 41,
    createdAt: '2026-05-12T11:45:00.000Z',
  },
  {
    id: 'betis-youth-revolution',
    contentKey: 'betis-youth-revolution',
    author: 'Admin',
    team: 'Real Betis Balompié',
    difficulty: 'easy',
    likes: 15,
    createdAt: '2026-05-01T08:00:00.000Z',
  },
];

export function getCommunityChallengePosts() {
  return [...COMMUNITY_CHALLENGE_POSTS].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export function getCommunityChallengeById(id) {
  return COMMUNITY_CHALLENGE_POSTS.find((p) => p.id === id) || null;
}
