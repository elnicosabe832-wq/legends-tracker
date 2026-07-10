import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { seasonLabel, seasonNumFromId } from '../utils/seasonUtils';

export default function SeasonTabs() {
  const { t } = useTranslation();
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
  const activeLabel = activeSeasonData
    ? seasonLabel(seasonNumFromId(activeSeasonData.id) || 1)
    : '';

  return (
    <div className="season-tabs-wrap">
      <div className="season-tabs">
        {career.seasons.map((s) => {
          const num = seasonNumFromId(s.id) || 1;
          return (
            <button
              key={s.id}
              type="button"
              className={`season-tab ${activeSeason === s.id ? 'active' : ''}`}
              onClick={() => setActiveSeason(s.id)}
            >
              {seasonLabel(num)}
            </button>
          );
        })}
        {career.seasons.length > 1 && (
          <button
            type="button"
            className={`season-tab total ${activeSeason === 'total' ? 'active' : ''}`}
            onClick={() => setActiveSeason('total')}
          >
            📊 {t('common.totalHistoric')}
            <span className="season-badge">{t('common.seasonsShort', { count: career.seasons.length })}</span>
          </button>
        )}
      </div>

      {canDeleteSeason && (
        <button
          type="button"
          className="delete-season-btn"
          onClick={() => deleteSeason(activeCareer, activeSeason)}
        >
          🗑️ {t('common.deleteSeason', { label: activeLabel })}
        </button>
      )}
    </div>
  );
}
