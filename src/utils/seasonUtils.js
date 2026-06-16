export function seasonLabel(num) {
  return `Temporada ${num}`;
}

/** Renumera ids y etiquetas según el orden en la carrera. */
export function normalizeSeasonLabels(seasons) {
  return (seasons || []).map((s, i) => ({
    ...s,
    id: `s${i + 1}`,
    label: seasonLabel(i + 1),
    players: (s.players || []).map((p) => ({ ...p })),
  }));
}

export function aggregatePlayers(seasons) {
  const map = {};
  seasons.forEach((s) => {
    s.players.forEach((p) => {
      if (!map[p.name]) map[p.name] = { ...p };
      else {
        map[p.name].matches += p.matches;
        map[p.name].goals += p.goals;
        map[p.name].assists += p.assists;
        map[p.name].cleanSheets += p.cleanSheets;
      }
    });
  });
  return Object.values(map);
}

export function buildRankings(players) {
  const top = (arr, key) =>
    [...arr].sort((a, b) => b[key] - a[key]).slice(0, 4).map((p) => ({
      name: p.name,
      pos: p.pos,
      matches: p.matches,
      value: p[key],
    }));

  return {
    goals: top(players, 'goals'),
    assists: top(players, 'assists'),
    matches: top(players, 'matches'),
    cleanSheets: top(players, 'cleanSheets'),
  };
}

export function getSeasonData(career, seasonId) {
  const seasons = career.seasons || [];
  if (seasonId === 'total') {
    const players = aggregatePlayers(seasons);
    const chronicle = seasons.length > 1
      ? generateHistoricalChronicle(seasons, career.name)
      : (seasons[0]?.chronicle || generateChronicle(players, career.name));
    return {
      label: 'Total Histórico',
      players,
      chronicle,
    };
  }
  const s = seasons.find((x) => x.id === seasonId);
  return s ? { label: s.label, players: s.players, chronicle: s.chronicle } : null;
}

export function getTopPlayer(players, stat, gkOnly) {
  let pool = players;
  if (gkOnly) pool = players.filter((p) => p.pos === 'POR');
  if (!pool.length) return { name: '—', pos: '', [stat]: 0 };
  return [...pool].sort((a, b) => b[stat] - a[stat])[0];
}

export function mergePlayerLists(lists) {
  const map = {};
  lists.flat().forEach((p) => {
    if (!p?.name) return;
    const key = p.name.trim();
    if (!map[key] || (p.matches || 0) > (map[key].matches || 0)) {
      map[key] = {
        name: key,
        pos: p.pos || '—',
        matches: Number(p.matches) || 0,
        goals: Number(p.goals) || 0,
        assists: Number(p.assists) || 0,
        cleanSheets: Number(p.cleanSheets) || 0,
      };
    }
  });
  return Object.values(map).filter((p) => p.matches > 0 || p.goals > 0 || p.assists > 0 || p.cleanSheets > 0);
}

export function generateChronicle(players, teamName) {
  const by = (key) => [...players].sort((a, b) => b[key] - a[key]);
  const topG = by('goals')[0];
  const topA = by('assists')[0];
  const topM = by('matches')[0];
  const topCS = players.filter((p) => p.pos === 'POR').sort((a, b) => b.cleanSheets - a.cleanSheets)[0]
    || by('cleanSheets')[0];

  return {
    headline: topG
      ? `${topG.name} lidera los goleadores del ${teamName} con ${topG.goals} tantos`
      : `Nueva jornada de estadísticas para ${teamName}`,
    body: [
      topG ? `${topG.name} es el máximo goleador con ${topG.goals} goles en ${topG.matches} partidos.` : '',
      topA ? `${topA.name} lidera las asistencias con ${topA.assists} pases de gol.` : '',
      topM ? `${topM.name} es el jugador más utilizado con ${topM.matches} partidos disputados.` : '',
      topCS ? `${topCS.name} suma ${topCS.cleanSheets} porterías a cero.` : '',
    ].filter(Boolean),
    sidebar: [
      topG && { label: 'Goleador', name: topG.name, value: `${topG.goals} goles` },
      topA && { label: 'Asistencias', name: topA.name, value: String(topA.assists) },
      topCS && { label: 'Porterías a cero', name: topCS.name, value: String(topCS.cleanSheets) },
      topM && { label: 'Más partidos', name: topM.name, value: `${topM.matches} PJ` },
    ].filter(Boolean),
  };
}

function buildPlayerEvolution(seasons) {
  const map = {};
  seasons.forEach((season, idx) => {
    (season.players || []).forEach((p) => {
      const key = p.name.trim();
      if (!map[key]) map[key] = { name: key, pos: p.pos, history: [] };
      map[key].pos = p.pos;
      map[key].history.push({
        seasonIndex: idx,
        label: season.label,
        goals: p.goals || 0,
        assists: p.assists || 0,
        matches: p.matches || 0,
        cleanSheets: p.cleanSheets || 0,
      });
    });
  });
  return Object.values(map);
}

function lastTwoDelta(history) {
  if (history.length < 2) return null;
  const prev = history[history.length - 2];
  const last = history[history.length - 1];
  return {
    prev,
    last,
    goalsDelta: last.goals - prev.goals,
    assistsDelta: last.assists - prev.assists,
    matchesDelta: last.matches - prev.matches,
  };
}

/** Crónica especial que cruza todas las temporadas de la carrera. */
export function generateHistoricalChronicle(seasons, teamName) {
  const totalSeasons = seasons.length;
  const aggregated = aggregatePlayers(seasons);
  const evolution = buildPlayerEvolution(seasons);

  const byGoals = [...aggregated].sort((a, b) => b.goals - a.goals);
  const byMatches = [...aggregated].sort((a, b) => b.matches - a.matches);
  const byAssists = [...aggregated].sort((a, b) => b.assists - a.assists);
  const topG = byGoals[0];
  const topM = byMatches[0];
  const topA = byAssists[0];

  const withDelta = evolution
    .map((p) => ({ ...p, delta: lastTwoDelta(p.history) }))
    .filter((p) => p.delta);

  const rising = [...withDelta]
    .filter((p) => p.delta.goalsDelta >= 2 || p.delta.assistsDelta >= 2)
    .sort((a, b) => {
      const scoreA = a.delta.goalsDelta * 2 + a.delta.assistsDelta;
      const scoreB = b.delta.goalsDelta * 2 + b.delta.assistsDelta;
      return scoreB - scoreA;
    })[0];

  const declining = [...withDelta]
    .filter((p) => p.delta.goalsDelta <= -2 || p.delta.matchesDelta <= -5)
    .sort((a, b) => a.delta.goalsDelta - b.delta.goalsDelta)[0];

  const everPresent = evolution
    .filter((p) => p.history.length === totalSeasons && p.history.every((h) => h.matches >= 5))
    .sort((a, b) => {
      const ma = a.history.reduce((s, h) => s + h.matches, 0);
      const mb = b.history.reduce((s, h) => s + h.matches, 0);
      return mb - ma;
    })[0];

  const breakout = evolution
    .filter((p) => p.history.length >= 2)
    .map((p) => {
      const first = p.history[0];
      const last = p.history[p.history.length - 1];
      const goalsGrowth = last.goals - first.goals;
      const totalGoals = p.history.reduce((s, h) => s + h.goals, 0);
      return { ...p, goalsGrowth, totalGoals, last };
    })
    .filter((p) => p.goalsGrowth >= 3 && p.last.goals >= 5)
    .sort((a, b) => b.goalsGrowth - a.goalsGrowth)[0];

  const seasonSummaries = seasons.map((s) => {
    const leader = [...s.players].sort((a, b) => b.goals - a.goals)[0];
    return leader
      ? `${s.label}: ${leader.name} (${leader.goals} goles)`
      : `${s.label}: sin datos`;
  });

  const body = [
    topG
      ? `Tras ${totalSeasons} temporadas, ${topG.name} es el máximo goleador histórico del ${teamName} con ${topG.goals} tantos en ${topG.matches} partidos.`
      : '',
    topM && topM.name !== topG?.name
      ? `${topM.name} lleva la mayor carga de minutos acumulados con ${topM.matches} partidos disputados.`
      : '',
    seasonSummaries.length
      ? `Resumen por temporada — ${seasonSummaries.join(' · ')}.`
      : '',
    rising
      ? `📈 Subida de nivel: ${rising.name} pasó de ${rising.delta.prev.goals} a ${rising.delta.last.goals} goles entre ${rising.delta.prev.label} y ${rising.delta.last.label}${rising.delta.assistsDelta > 0 ? `, y mejoró sus asistencias (+${rising.delta.assistsDelta})` : ''}.`
      : '',
    breakout && breakout.name !== rising?.name
      ? `⭐ Proyección estrella: ${breakout.name} ha crecido ${breakout.goalsGrowth} goles desde su debut en el club (${breakout.totalGoals} en total).`
      : '',
    everPresent
      ? `🛡️ Continuidad: ${everPresent.name} ha jugado las ${totalSeasons} temporadas y suma ${everPresent.history.reduce((s, h) => s + h.matches, 0)} partidos.`
      : '',
    declining
      ? `📉 Bajón de rendimiento: ${declining.name} bajó de ${declining.delta.prev.goals} a ${declining.delta.last.goals} goles${declining.delta.matchesDelta < 0 ? ` y perdió ${Math.abs(declining.delta.matchesDelta)} partidos` : ''}.`
      : '',
  ].filter(Boolean);

  const headline = rising && topG?.name === rising.name
    ? `${rising.name}, en racha: ${topG.goals} goles históricos y sigue ascendendo en el ${teamName}`
    : topG
      ? `Crónica histórica: ${topG.name} encabeza una era con ${topG.goals} goles en ${totalSeasons} temporadas`
      : `Historia acumulada del ${teamName} tras ${totalSeasons} temporadas`;

  const insights = [];
  if (topG) {
    insights.push({
      type: 'legend',
      icon: '👑',
      title: 'Leyenda del club',
      text: `${topG.name} — ${topG.goals} goles y ${topG.matches} PJ en ${totalSeasons} temporadas.`,
    });
  }
  if (rising) {
    insights.push({
      type: 'rise',
      icon: '📈',
      title: 'Subida de nivel',
      text: `${rising.name}: ${rising.delta.prev.goals} → ${rising.delta.last.goals} goles (${rising.delta.prev.label} → ${rising.delta.last.label}).`,
    });
  }
  if (breakout) {
    insights.push({
      type: 'star',
      icon: '⭐',
      title: 'Camino a estrella',
      text: `${breakout.name} lleva +${breakout.goalsGrowth} goles de crecimiento desde su primera temporada.`,
    });
  }
  if (everPresent) {
    insights.push({
      type: 'continuity',
      icon: '🛡️',
      title: 'Continuidad',
      text: `${everPresent.name} presente en las ${totalSeasons} temporadas registradas.`,
    });
  }
  if (declining) {
    insights.push({
      type: 'drop',
      icon: '📉',
      title: 'Bajada de nivel',
      text: `${declining.name}: ${declining.delta.prev.goals} → ${declining.delta.last.goals} goles recientes.`,
    });
  }
  if (topA && topA.name !== topG?.name) {
    insights.push({
      type: 'assist',
      icon: '🎯',
      title: 'Motor de juego',
      text: `${topA.name} lidera asistencias históricas con ${topA.assists}.`,
    });
  }

  return {
    headline,
    body,
    sidebar: [
      topG && { label: 'Goleador histórico', name: topG.name, value: `${topG.goals} goles` },
      topA && { label: 'Asistencias totales', name: topA.name, value: String(topA.assists) },
      topM && { label: 'Más partidos', name: topM.name, value: `${topM.matches} PJ` },
      { label: 'Temporadas', name: teamName, value: String(totalSeasons) },
    ].filter(Boolean),
    insights,
  };
}

/** Destacados de evolución entre la última y la anterior temporada (para el Muro). */
export function getPlayerMovers(seasons, limit = 4) {
  if (seasons.length < 2) return { risers: [], fallers: [] };

  const evolution = buildPlayerEvolution(seasons);
  const withDelta = evolution
    .map((p) => ({ ...p, delta: lastTwoDelta(p.history) }))
    .filter((p) => p.delta);

  const mapMover = (p) => ({
    name: p.name,
    pos: p.pos,
    goalsDelta: p.delta.goalsDelta,
    assistsDelta: p.delta.assistsDelta,
    matchesDelta: p.delta.matchesDelta,
    prevLabel: p.delta.prev.label,
    lastLabel: p.delta.last.label,
    prevGoals: p.delta.prev.goals,
    lastGoals: p.delta.last.goals,
  });

  const risers = [...withDelta]
    .filter((p) => p.delta.goalsDelta > 0 || p.delta.assistsDelta > 0)
    .sort((a, b) => {
      const scoreA = a.delta.goalsDelta * 2 + a.delta.assistsDelta;
      const scoreB = b.delta.goalsDelta * 2 + b.delta.assistsDelta;
      return scoreB - scoreA;
    })
    .slice(0, limit)
    .map(mapMover);

  const fallers = [...withDelta]
    .filter((p) => p.delta.goalsDelta < 0 || p.delta.matchesDelta <= -3)
    .sort((a, b) => a.delta.goalsDelta - b.delta.goalsDelta)
    .slice(0, limit)
    .map(mapMover);

  return { risers, fallers };
}
