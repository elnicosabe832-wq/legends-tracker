/**
 * Escudos locales (SVG propios, estilo fan — no logos oficiales).
 * Si no hay archivo, ClubCrest usa iniciales + colores.
 */
export const CLUB_CRESTS = {
  barrow: { file: '/crests/barrow.svg', colors: ['#0033A0', '#FFFFFF'] },
  'real-madrid': { file: '/crests/real-madrid.svg', colors: ['#FEBE10', '#FFFFFF'] },
  'fc-barcelona': { file: '/crests/fc-barcelona.svg', colors: ['#A50044', '#004D98'] },
  liverpool: { file: '/crests/liverpool.svg', colors: ['#C8102E', '#00B2A9'] },
  'manchester-city': { file: '/crests/manchester-city.svg', colors: ['#6CABDD', '#1C2C5B'] },
  'manchester-united': { file: '/crests/manchester-united.svg', colors: ['#DA291C', '#FBE122'] },
  arsenal: { file: '/crests/arsenal.svg', colors: ['#EF0107', '#063672'] },
  chelsea: { file: '/crests/chelsea.svg', colors: ['#034694', '#DBA111'] },
  'atletico-madrid': { file: '/crests/atletico-madrid.svg', colors: ['#CB3524', '#FFFFFF'] },
  'real-betis': { file: '/crests/real-betis.svg', colors: ['#0BB363', '#FFFFFF'] },
  juventus: { file: '/crests/juventus.svg', colors: ['#000000', '#FFFFFF'] },
  'fc-bayern-munchen': { file: '/crests/fc-bayern-munchen.svg', colors: ['#DC052D', '#0066B2'] },
  'athletic-club': { file: '/crests/athletic-club.svg', colors: ['#EE2523', '#FFFFFF'] },
  'tottenham-hotspur': { file: '/crests/tottenham-hotspur.svg', colors: ['#132257', '#FFFFFF'] },
  'newcastle-united': { file: '/crests/newcastle-united.svg', colors: ['#241F20', '#FFFFFF'] },
};

export function getClubCrestMeta(clubId) {
  if (!clubId) return null;
  return CLUB_CRESTS[clubId] || null;
}

export function clubInitials(name = '') {
  const parts = name.replace(/A\.?F\.?C\.?/gi, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name.slice(0, 2) || '??').toUpperCase();
}
