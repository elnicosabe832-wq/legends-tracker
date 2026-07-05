import { buildPlayerEvolution } from './seasonUtils';

const FREE_SEASON_LIMIT = 2;
const PRO_SEASON_LIMIT = 15;

export function getPlayerEvolutionList(seasons) {
  return buildPlayerEvolution(seasons || []);
}

export function buildChartSeries(seasons, playerName, isPro) {
  const evolution = buildPlayerEvolution(seasons);
  const player = evolution.find((p) => p.name === playerName);
  if (!player?.history?.length) return { points: [], limited: false };

  let history = player.history;
  const limited = !isPro && history.length > FREE_SEASON_LIMIT;
  if (limited) {
    history = history.slice(-FREE_SEASON_LIMIT);
  } else if (isPro && history.length > PRO_SEASON_LIMIT) {
    history = history.slice(-PRO_SEASON_LIMIT);
  }

  const points = history.map((h) => {
    const rating = h.matches > 0
      ? Number(((h.goals + h.assists * 0.7) / h.matches * 10).toFixed(2))
      : 0;
    const goalsPerMatch = h.matches > 0 ? Number((h.goals / h.matches).toFixed(2)) : 0;

    return {
      season: h.label.replace('Temporada ', 'T'),
      goals: h.goals,
      assists: h.assists,
      matches: h.matches,
      rating,
      goalsPerMatch,
    };
  });

  return { points, limited, player };
}
