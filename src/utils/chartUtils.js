import { buildPlayerEvolution, getTopPlayer, aggregatePlayers } from './seasonUtils';

const FREE_SEASON_LIMIT = 2;
const PRO_SEASON_LIMIT = 15;

export function isGoalkeeper(pos) {
  return pos === 'POR';
}

function shortenSeasonLabel(label) {
  return (label || '').replace(/^(Temporada|Season)\s+/i, 'T');
}

function sliceSeasons(items, isPro) {
  const limited = !isPro && items.length > FREE_SEASON_LIMIT;
  if (limited) return { items: items.slice(-FREE_SEASON_LIMIT), limited: true };
  if (isPro && items.length > PRO_SEASON_LIMIT) {
    return { items: items.slice(-PRO_SEASON_LIMIT), limited: false };
  }
  return { items, limited: false };
}

export function getPlayerEvolutionList(seasons) {
  return buildPlayerEvolution(seasons || []);
}

export function buildChartSeries(seasons, playerName, isPro) {
  const evolution = buildPlayerEvolution(seasons);
  const player = evolution.find((p) => p.name === playerName);
  if (!player?.history?.length) return { points: [], limited: false, player: null };

  const { items: history, limited } = sliceSeasons(player.history, isPro);

  const points = history.map((h) => {
    const ga = h.goals + h.assists;
    const rating = h.matches > 0
      ? Number(((h.goals + h.assists * 0.7) / h.matches * 10).toFixed(2))
      : 0;
    const gaPerMatch = h.matches > 0 ? Number((ga / h.matches).toFixed(2)) : 0;

    return {
      season: shortenSeasonLabel(h.label),
      goals: h.goals,
      assists: h.assists,
      matches: h.matches,
      cleanSheets: h.cleanSheets || 0,
      ga,
      gaPerMatch,
      rating,
    };
  });

  return { points, limited, player };
}

export function buildClubChartSeries(seasons, isPro) {
  const list = (seasons || []).map((s) => {
    const players = s.players || [];
    const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);
    const totalAssists = players.reduce((sum, p) => sum + (p.assists || 0), 0);
    const ga = totalGoals + totalAssists;
    const teamMatches = players.reduce((max, p) => Math.max(max, p.matches || 0), 0);
    const gaPerMatch = teamMatches > 0 ? Number((ga / teamMatches).toFixed(2)) : 0;

    return {
      season: shortenSeasonLabel(s.label),
      totalGoals,
      totalAssists,
      ga,
      teamMatches,
      gaPerMatch,
    };
  });

  return sliceSeasons(list, isPro);
}

export function buildClubMilestones(seasons) {
  const series = buildClubChartSeries(seasons, true).items;
  if (!series.length) return null;

  const bestGoals = [...series].sort((a, b) => b.totalGoals - a.totalGoals)[0];
  const bestAssists = [...series].sort((a, b) => b.totalAssists - a.totalAssists)[0];
  const bestGa = [...series].sort((a, b) => b.ga - a.ga)[0];
  const bestGaPerMatch = [...series].sort((a, b) => b.gaPerMatch - a.gaPerMatch)[0];

  const last = series[series.length - 1];
  const prev = series.length > 1 ? series[series.length - 2] : null;

  return {
    bestGoals,
    bestAssists,
    bestGa,
    bestGaPerMatch,
    last,
    prev,
    deltaGa: prev ? last.ga - prev.ga : null,
    deltaGaPerMatch: prev ? Number((last.gaPerMatch - prev.gaPerMatch).toFixed(2)) : null,
  };
}

export function buildClubRecordsTrend(seasons, records, isPro) {
  if (!records?.length) return { points: [], limited: false };

  const points = (seasons || []).map((s) => {
    const row = { season: shortenSeasonLabel(s.label) };
    records.forEach((rec) => {
      const top = getTopPlayer(s.players || [], rec.stat, rec.gkOnly);
      const val = top[rec.stat] || 0;
      row[rec.stat] = val;
      row[`${rec.stat}Pct`] = rec.record > 0
        ? Math.min(100, Math.round((val / rec.record) * 100))
        : 0;
    });
    return row;
  });

  return sliceSeasons(points, isPro);
}

export function buildClubCareerTotals(seasons) {
  const players = aggregatePlayers(seasons || []);
  const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);
  const totalAssists = players.reduce((sum, p) => sum + (p.assists || 0), 0);
  return {
    totalGoals,
    totalAssists,
    ga: totalGoals + totalAssists,
    playerCount: players.length,
  };
}
