import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { getTopPlayer } from '../utils/seasonUtils';
import { getClubRecords, hasClubRecords } from '../data/clubRecords';
import ClubCrest from './ClubCrest';
import ShareHistoryCard from './ShareHistoryCard';

const SHORT_LABELS = {
  goals: { es: 'Goles', en: 'Goals' },
  assists: { es: 'Asistencias', en: 'Assists' },
  matches: { es: 'Partidos', en: 'Apps' },
  cleanSheets: { es: 'Porterías a cero', en: 'Clean sheets' },
};

export default function RealLifeCompare({ career, seasonData }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es';
  const cardRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const linked = career?.linkedClub;
  const records = linked ? getClubRecords(linked.clubId) : (career?.realLife ?? []);

  const rows = useMemo(() => {
    if (!records.length || !seasonData?.players) return [];
    return records.map((item) => {
      const top = getTopPlayer(seasonData.players, item.stat, item.gkOnly);
      const yourVal = top[item.stat] || 0;
      const pct = item.record > 0
        ? Math.min(100, Math.round((yourVal / item.record) * 100))
        : 0;
      const pctClass = pct >= 50 ? 'high' : pct >= 20 ? 'mid' : 'low';
      return {
        category: item.category,
        shortLabel: SHORT_LABELS[item.stat]?.[lang] || item.category,
        youLabel: `${top.name}: ${yourVal} ${item.unit}`,
        realLabel: `${item.recordHolder}: ${item.record}`,
        yourVal,
        pct,
        pctClass,
        unit: item.unit,
      };
    });
  }, [records, seasonData, lang]);

  if (!linked && !records.length) return null;

  const clubLabel = linked
    ? `${linked.clubName} (${linked.leagueName})`
    : career.name;

  if (linked && !hasClubRecords(linked.clubId)) {
    return (
      <div className="real-compare real-compare-pending">
        <h3>⚖️ {t('shareHistory.title')}</h3>
        <p>
          {t('shareHistory.noRecords', { club: clubLabel })}
        </p>
      </div>
    );
  }

  if (!records.length) return null;

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0e17',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const fileName = `legends-vs-history-${(linked?.clubId || 'club')}.png`;

      if (blob && typeof navigator.share === 'function') {
        try {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (!navigator.canShare || navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: t('shareHistory.shareTitle'),
              text: t('shareHistory.shareText', { club: linked?.clubName || career.name }),
              files: [file],
            });
            return;
          }
        } catch {
          /* cancelled or unsupported → download */
        }
      }

      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      /* silent */
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="real-compare" id="realCompare">
      <div className="real-compare-head">
        <div className="real-compare-title-row">
          {linked && (
            <ClubCrest
              clubId={linked.clubId}
              clubName={linked.clubName}
              size={40}
            />
          )}
          <h3>⚖️ {t('shareHistory.title')}</h3>
        </div>
        <button
          type="button"
          className="share-history-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? t('shareHistory.generating') : t('shareHistory.export')}
        </button>
      </div>

      <p>
        <strong>{clubLabel}</strong> — {seasonData.label}{' '}
        {t('shareHistory.vsHint')}
      </p>

      <table className="compare-table">
        <thead>
          <tr>
            <th>{t('shareHistory.colRecord')}</th>
            <th>{t('shareHistory.colYou')}</th>
            <th>{t('shareHistory.colReal')}</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.category}>
              <td>{row.category}</td>
              <td className="you">{row.youLabel}</td>
              <td className="real">{row.realLabel}</td>
              <td className={`pct ${row.pctClass}`}>{row.pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Off-screen card for PNG export (IG-friendly) */}
      <div className="share-history-export-stage" aria-hidden="true">
        <ShareHistoryCard
          ref={cardRef}
          clubId={linked?.clubId}
          clubName={linked?.clubName || career.name}
          leagueName={linked?.leagueName || ''}
          seasonLabel={seasonData.label}
          rows={rows}
        />
      </div>
    </div>
  );
}
