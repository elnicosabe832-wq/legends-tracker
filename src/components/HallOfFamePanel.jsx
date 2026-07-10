import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { getHallOfFameCandidates } from '../utils/hallOfFameUtils';
import ProFeatureGate from './ProFeatureGate';

export default function HallOfFamePanel({ career }) {
  const { t } = useTranslation();
  const { isPro, setShowPremiumModal, enshrinePlayer, activeCareer } = useApp();

  const hall = career.hallOfFame || [];
  const enshrinedNames = hall.map((h) => h.snapshot.name);
  const candidates = getHallOfFameCandidates(career, enshrinedNames);

  const content = (
    <div className="hall-of-fame">
      <div className="hof-intro">
        <h3>👑 {t('muro.hallOfFame')}</h3>
        <p>{t('muro.hofIntro')}</p>
      </div>

      {hall.length > 0 && (
        <div className="hof-grid">
          {hall.map((entry) => (
            <article key={entry.id} className="hof-card">
              <div className="hof-card-shine" aria-hidden="true" />
              <span className="hof-card-badge">{entry.isLegend ? 'LEGEND' : 'ICON'}</span>
              {entry.status === 'retired' && (
                <span className="hof-card-status">{t('muro.hofRetired')}</span>
              )}
              <h4>{entry.snapshot.name}</h4>
              <p className="hof-card-pos">{entry.snapshot.pos}</p>
              <div className="hof-card-stats">
                <span>{entry.snapshot.goals} ⚽</span>
                <span>{entry.snapshot.assists} 🎯</span>
                <span>{entry.snapshot.matches} {t('common.matchesPlayed')}</span>
              </div>
              <div className="hof-card-badges">
                {(entry.badges || []).map((b) => (
                  <span key={b} className="hof-insignia">{b}</span>
                ))}
              </div>
              {entry.reason && <p className="hof-card-reason">{entry.reason}</p>}
            </article>
          ))}
        </div>
      )}

      {candidates.length > 0 && (
        <div className="hof-candidates">
          <h4>{t('muro.hofAdd')}</h4>
          <p className="hof-candidates-hint">{t('muro.hofCandidatesHint')}</p>
          <ul className="hof-candidate-list">
            {candidates.map((p) => (
              <li key={p.name}>
                <div>
                  <strong>{p.name}</strong>
                  <span>{p.pos} · {p.goals} goles · {p.matches} {t('common.matchesPlayed')}</span>
                </div>
                <button
                  type="button"
                  className="hof-enshrine-btn"
                  onClick={() => enshrinePlayer(activeCareer, p.name)}
                >
                  {t('muro.hofEnshrine')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hall.length === 0 && candidates.length === 0 && (
        <p className="hof-empty">{t('muro.hofEmpty')}</p>
      )}
    </div>
  );

  if (isPro) return content;

  return (
    <ProFeatureGate
      locked
      label={t('muro.hallOfFame')}
      onUnlock={() => setShowPremiumModal(true)}
    >
      {content}
    </ProFeatureGate>
  );
}
