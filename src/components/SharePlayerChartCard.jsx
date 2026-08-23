import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SITE_URL, SITE_NAME } from '../lib/site';

const SharePlayerChartCard = forwardRef(function SharePlayerChartCard({
  playerName,
  pos,
  careerName,
  careerTotals,
  points,
  gk,
}, ref) {
  const { t } = useTranslation();
  const maxVal = Math.max(
    ...points.flatMap((p) => (gk ? [p.cleanSheets] : [p.goals, p.assists])),
    1,
  );

  return (
    <div ref={ref} className="share-player-card">
      <div className="share-player-glow" aria-hidden="true" />

      <header className="share-player-top">
        <span className="share-player-brand">
          <span className="green">Legends</span> <span className="blue">Tracker</span>
        </span>
        <span className="share-player-kicker">{t('sharePlayer.kicker')}</span>
      </header>

      <div className="share-player-head">
        <span className="share-player-icon">{gk ? '🧤' : '⚽'}</span>
        <div>
          <h2>{playerName}</h2>
          <p>{pos} · {careerName}</p>
        </div>
      </div>

      <div className="share-player-totals">
        {!gk && (
          <>
            <div className="share-player-stat">
              <strong>{careerTotals.goals}</strong>
              <span>{t('muro.chartGoals')}</span>
            </div>
            <div className="share-player-stat">
              <strong>{careerTotals.assists}</strong>
              <span>{t('muro.chartAssists')}</span>
            </div>
          </>
        )}
        {gk && (
          <div className="share-player-stat">
            <strong>{careerTotals.cleanSheets}</strong>
            <span>{t('muro.cleanSheets')}</span>
          </div>
        )}
        <div className="share-player-stat">
          <strong>{careerTotals.matches}</strong>
          <span>{t('common.matchesPlayed')}</span>
        </div>
      </div>

      <ul className="share-player-seasons">
        {points.map((pt) => (
          <li key={pt.season} className="share-player-season-row">
            <span className="share-player-season-label">{pt.season}</span>
            <div className="share-player-bars">
              {gk ? (
                <div className="share-player-bar-wrap">
                  <div
                    className="share-player-bar cs"
                    style={{ width: `${(pt.cleanSheets / maxVal) * 100}%` }}
                  />
                  <span>{pt.cleanSheets} 🧤</span>
                </div>
              ) : (
                <>
                  <div className="share-player-bar-wrap">
                    <div
                      className="share-player-bar goals"
                      style={{ width: `${(pt.goals / maxVal) * 100}%` }}
                    />
                    <span>{pt.goals}⚽</span>
                  </div>
                  <div className="share-player-bar-wrap">
                    <div
                      className="share-player-bar assists"
                      style={{ width: `${(pt.assists / maxVal) * 100}%` }}
                    />
                    <span>{pt.assists}🎯</span>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <footer className="share-player-foot">
        <span>{SITE_NAME}</span>
        <span>{SITE_URL.replace(/^https:\/\//, '')}</span>
      </footer>
    </div>
  );
});

export default SharePlayerChartCard;
