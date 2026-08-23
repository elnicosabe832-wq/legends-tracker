import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { buildChartSeries, isGoalkeeper } from '../utils/chartUtils';
import { exportElementAsPng } from '../utils/chartExport';
import SharePlayerChartCard from './SharePlayerChartCard';
import {
  getPlayerProfile,
  profileBadgeParts,
} from '../utils/playerProfileUtils';
import ProFeatureGate from './ProFeatureGate';

const CHART_THEME = {
  grid: '#1e293b',
  text: '#94a3b8',
  goals: '#00ff88',
  assists: '#00d4ff',
  matches: '#ffd700',
  cleanSheets: '#a78bfa',
  gaPerMatch: '#f472b6',
};

export default function PlayerStatsModal({
  player,
  career,
  onClose,
  onEditProfile,
}) {
  const { t } = useTranslation();
  const { isPro, setShowPremiumModal } = useApp();
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const { points, limited, player: evolutionPlayer } = useMemo(
    () => buildChartSeries(career?.seasons || [], player?.name, isPro),
    [career?.seasons, player?.name, isPro],
  );

  if (!player) return null;

  const gk = isGoalkeeper(player.pos);
  const profile = getPlayerProfile(career, player.name);
  const badges = profileBadgeParts(profile, t);
  const hasChart = points.length >= 2;

  const handleShare = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const slug = player.name.toLowerCase().replace(/\s+/g, '-');
      await exportElementAsPng(exportRef.current, {
        fileName: `legends-player-${slug}.png`,
        shareTitle: t('sharePlayer.shareTitle', { player: player.name }),
        shareText: t('sharePlayer.shareText', {
          player: player.name,
          club: career?.name || '',
        }),
      });
    } catch {
      /* silent */
    } finally {
      setExporting(false);
    }
  };

  const chart = hasChart ? (
    <div className="performance-chart-canvas player-stats-chart">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
          <XAxis dataKey="season" stroke={CHART_THEME.text} fontSize={12} />
          <YAxis stroke={CHART_THEME.text} fontSize={12} />
          <Tooltip
            contentStyle={{
              background: '#111827',
              border: '1px solid #1e293b',
              borderRadius: 8,
              color: '#e2e8f0',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="matches"
            name={t('common.matchesPlayed')}
            stroke={CHART_THEME.matches}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          {gk ? (
            <Line
              type="monotone"
              dataKey="cleanSheets"
              name={t('muro.cleanSheets')}
              stroke={CHART_THEME.cleanSheets}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="goals"
                name={t('muro.chartGoals')}
                stroke={CHART_THEME.goals}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="assists"
                name={t('muro.chartAssists')}
                stroke={CHART_THEME.assists}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="gaPerMatch"
                name={t('muro.playerGaPerMatch')}
                stroke={CHART_THEME.gaPerMatch}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="player-stats-single">{t('muro.playerStatsSingleSeason')}</p>
  );

  const wrappedChart = isPro ? chart : (
    <ProFeatureGate
      locked={limited}
      label={t('muro.chartLocked')}
      onUnlock={() => setShowPremiumModal(true)}
    >
      {chart}
    </ProFeatureGate>
  );

  return (
    <div className="modal-overlay visible" onClick={onClose}>
      <div className="modal player-stats-modal" onClick={(ev) => ev.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>✕</button>
        <div className="player-stats-head">
          <div className="player-stats-icon">{gk ? '🧤' : '⚽'}</div>
          <div className="player-stats-head-text">
            <h2>{player.name}</h2>
            <p className="player-stats-sub">
              {player.pos} · {player.goals}⚽ {player.assists}🎯 · {player.matches} {t('common.matchesPlayed')}
              {gk && player.cleanSheets > 0 && ` · ${player.cleanSheets} 🧤`}
            </p>
            {badges.length > 0 && (
              <span className="player-profile-badges">
                {badges.map((b) => (
                  <span key={b} className="player-profile-badge">{b}</span>
                ))}
              </span>
            )}
          </div>
          {hasChart && (
            <button
              type="button"
              className="share-history-btn chart-share-btn"
              onClick={handleShare}
              disabled={exporting}
            >
              {exporting ? t('sharePlayer.generating') : t('sharePlayer.export')}
            </button>
          )}
        </div>

        {wrappedChart}

        {hasChart && (
          <div className="player-stats-table-wrap">
            <h4>{t('muro.playerSeasonBreakdown')}</h4>
            <table className="player-stats-table">
              <thead>
                <tr>
                  <th>{t('common.seasonCol')}</th>
                  <th>{t('common.matchesPlayed')}</th>
                  {gk ? (
                    <th>{t('muro.cleanSheets')}</th>
                  ) : (
                    <>
                      <th>{t('muro.chartGoals')}</th>
                      <th>{t('muro.chartAssists')}</th>
                      <th>{t('muro.playerGaPerMatch')}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {points.map((pt) => (
                  <tr key={pt.season}>
                    <td>{pt.season}</td>
                    <td>{pt.matches}</td>
                    {gk ? (
                      <td>{pt.cleanSheets}</td>
                    ) : (
                      <>
                        <td>{pt.goals}</td>
                        <td>{pt.assists}</td>
                        <td>{pt.gaPerMatch}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {evolutionPlayer?.history?.length === 1 && (
          <div className="player-stats-table-wrap">
            <table className="player-stats-table">
              <tbody>
                <tr>
                  <td>{points[0]?.season}</td>
                  <td>{points[0]?.matches} {t('common.matchesPlayed')}</td>
                  {gk ? (
                    <td>{points[0]?.cleanSheets} {t('muro.cleanSheets')}</td>
                  ) : (
                    <td>{points[0]?.goals}⚽ · {points[0]?.assists}🎯</td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions premium-modal-actions">
          <button type="button" className="modal-btn-secondary" onClick={() => onEditProfile?.(player)}>
            ✏️ {t('playerProfile.edit')}
          </button>
          <button type="button" className="modal-btn-primary" onClick={onClose}>
            {t('playerProfile.cancel')}
          </button>
        </div>

        <div className="share-player-export-stage" aria-hidden="true">
          <SharePlayerChartCard
            ref={exportRef}
            playerName={player.name}
            pos={player.pos}
            careerName={career?.name || ''}
            careerTotals={{
              goals: player.goals,
              assists: player.assists,
              matches: player.matches,
              cleanSheets: player.cleanSheets || 0,
            }}
            points={points}
            gk={gk}
          />
        </div>
      </div>
    </div>
  );
}
