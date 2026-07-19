import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import ClubCrest from './ClubCrest';
import { SITE_URL, SITE_NAME } from '../lib/site';

const ShareHistoryCard = forwardRef(function ShareHistoryCard({
  clubName,
  clubId,
  leagueName,
  seasonLabel,
  rows,
}, ref) {
  const { t } = useTranslation();
  const best = rows.length
    ? Math.max(...rows.map((r) => r.pct))
    : 0;

  return (
    <div ref={ref} className="share-history-card">
      <div className="share-history-glow" aria-hidden="true" />

      <header className="share-history-top">
        <span className="share-history-brand">
          <span className="green">Legends</span> <span className="blue">Tracker</span>
        </span>
        <span className="share-history-kicker">{t('shareHistory.kicker')}</span>
      </header>

      <div className="share-history-club">
        <ClubCrest clubId={clubId} clubName={clubName} size={88} />
        <div className="share-history-club-text">
          <h2>{clubName}</h2>
          <p>{leagueName}</p>
          <span className="share-history-season">{seasonLabel}</span>
        </div>
      </div>

      <p className="share-history-headline">
        {t('shareHistory.headline', { pct: best })}
      </p>

      <ul className="share-history-rows">
        {rows.map((row) => (
          <li key={row.category} className="share-history-row">
            <div className="share-history-row-head">
              <strong>{row.shortLabel || row.category}</strong>
              <span className={`share-history-pct pct-${row.pctClass}`}>{row.pct}%</span>
            </div>
            <div className="share-history-bar">
              <div
                className={`share-history-fill pct-${row.pctClass}`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
            <div className="share-history-row-meta">
              <span className="you">{row.youLabel}</span>
              <span className="real">{row.realLabel}</span>
            </div>
          </li>
        ))}
      </ul>

      <footer className="share-history-foot">
        <span>{SITE_NAME}</span>
        <span>{SITE_URL.replace(/^https:\/\//, '')}</span>
      </footer>
    </div>
  );
});

export default ShareHistoryCard;
