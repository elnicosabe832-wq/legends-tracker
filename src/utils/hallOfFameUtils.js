import { aggregatePlayers } from './seasonUtils';

export function computeLegendBadges(snapshot, allPlayers) {
  const badges = [];
  const sortedGoals = [...allPlayers].sort((a, b) => b.goals - a.goals);
  const sortedAssists = [...allPlayers].sort((a, b) => b.assists - a.assists);
  const sortedMatches = [...allPlayers].sort((a, b) => b.matches - a.matches);

  if (sortedGoals[0]?.name === snapshot.name) badges.push('👑 Máximo goleador');
  if (sortedAssists[0]?.name === snapshot.name) badges.push('🎯 Rey de asistencias');
  if (snapshot.goals >= 50) badges.push('⚽ 50+ goles históricos');
  if (snapshot.goals >= 100) badges.push('🏆 Centenario goleador');
  if (snapshot.matches >= 100) badges.push('🛡️ 100+ partidos');
  if (sortedMatches[0]?.name === snapshot.name) badges.push('📋 Titular histórico');
  if (snapshot.cleanSheets >= 30) badges.push('🧤 Leyenda bajo palos');

  if (!badges.length) badges.push('⭐ Leyenda del club');
  return badges;
}

/** Jugadores en el histórico que ya no están en la última plantilla. */
export function getHallOfFameCandidates(career, enshrinedNames = []) {
  const seasons = career.seasons || [];
  if (seasons.length < 2) return [];

  const totals = aggregatePlayers(seasons);
  const lastRoster = new Set((seasons[seasons.length - 1]?.players || []).map((p) => p.name));
  const enshrined = new Set(enshrinedNames);

  return totals
    .filter((p) => !lastRoster.has(p.name) && !enshrined.has(p.name))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 12);
}

export function buildEnshrinementSnapshot(career, playerName) {
  const seasons = career.seasons || [];
  const totals = aggregatePlayers(seasons);
  const player = totals.find((p) => p.name === playerName);
  if (!player) return null;

  let seasonsPlayed = 0;
  seasons.forEach((s) => {
    if (s.players?.some((p) => p.name === playerName)) seasonsPlayed += 1;
  });

  const snapshot = {
    name: player.name,
    pos: player.pos,
    matches: player.matches,
    goals: player.goals,
    assists: player.assists,
    cleanSheets: player.cleanSheets,
    seasonsPlayed,
  };

  return {
    snapshot,
    badges: computeLegendBadges(snapshot, totals),
  };
}
