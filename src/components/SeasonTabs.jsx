import { useApp } from '../context/AppContext';

export default function SeasonTabs() {
  const {
    career,
    activeCareer,
    activeSeason,
    setActiveSeason,
    deleteSeason,
  } = useApp();

  if (!career?.seasons?.length) return null;

  const activeSeasonData = career.seasons.find((s) => s.id === activeSeason);
  const canDeleteSeason = activeSeason !== 'total' && activeSeasonData;

  return (
    <div className="season-tabs-wrap">
      <div className="season-tabs">
        {career.seasons.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`season-tab ${activeSeason === s.id ? 'active' : ''}`}
            onClick={() => setActiveSeason(s.id)}
          >
            {s.label}
          </button>
        ))}
        {career.seasons.length > 1 && (
          <button
            type="button"
            className={`season-tab total ${activeSeason === 'total' ? 'active' : ''}`}
            onClick={() => setActiveSeason('total')}
          >
            📊 Total Histórico
            <span className="season-badge">{career.seasons.length} temps.</span>
          </button>
        )}
      </div>

      {canDeleteSeason && (
        <button
          type="button"
          className="delete-season-btn"
          onClick={() => deleteSeason(activeCareer, activeSeason)}
        >
          🗑️ Eliminar {activeSeasonData.label}
        </button>
      )}
    </div>
  );
}
