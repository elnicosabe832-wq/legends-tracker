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
  return Object.values(map).filter(
    (p) => p.matches > 0 || p.goals > 0 || p.assists > 0 || p.cleanSheets > 0
  );
}
