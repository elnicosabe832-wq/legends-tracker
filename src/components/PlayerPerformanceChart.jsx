import { useState, useMemo, useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
import { getPlayerEvolutionList, buildChartSeries, isGoalkeeper } from '../utils/chartUtils';
import { exportElementAsPng } from '../utils/chartExport';
import PlayerSearchInput from './PlayerSearchInput';
import SharePlayerChartCard from './SharePlayerChartCard';
import ProFeatureGate from './ProFeatureGate';

const CHART_THEME = {
  grid: '#1e293b',
  text: '#94a3b8',
  goals: '#00ff88',
  assists: '#00d4ff',
  matches: '#f472b6',
  cleanSheets: '#a78bfa',
  gaPerMatch: '#38bdf8',
};

export default function PlayerPerformanceChart({
  seasons,
  career,
  initialPlayer = '',
  compact = false,
}) {
  const { t } = useTranslation();
  const { isPro, setShowPremiumModal } = useApp();
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const evolution = useMemo(() => getPlayerEvolutionList(seasons), [seasons]);
  const [selected, setSelected] = useState(initialPlayer || evolution[0]?.name || '');

  useEffect(() => {
    if (initialPlayer) setSelected(initialPlayer);
  }, [initialPlayer]);

  const { points, limited, player: chartPlayer } = useMemo(
    () => buildChartSeries(seasons, selected, isPro),
    [seasons, selected, isPro],
  );

  if (evolution.length < 2) return null;

  const gk = isGoalkeeper(chartPlayer?.pos);
  const careerTotals = chartPlayer?.history?.reduce(
    (acc, h) => ({
      goals: acc.goals + h.goals,
      assists: acc.assists + h.assists,
      matches: acc.matches + h.matches,
      cleanSheets: acc.cleanSheets + (h.cleanSheets || 0),
    }),
    { goals: 0, assists: 0, matches: 0, cleanSheets: 0 },
  ) || { goals: 0, assists: 0, matches: 0, cleanSheets: 0 };

  const handleShare = async () => {
    if (!exportRef.current || !selected) return;
    setExporting(true);
    try {
      const slug = selected.toLowerCase().replace(/\s+/g, '-');
      await exportElementAsPng(exportRef.current, {
        fileName: `legends-player-${slug}.png`,
        shareTitle: t('sharePlayer.shareTitle', { player: selected }),
        shareText: t('sharePlayer.shareText', {
          player: selected,
          club: career?.name || '',
        }),
      });
    } catch {
      /* silent */
    } finally {
      setExporting(false);
    }
  };

  const chart = (
    <div className={`performance-chart${compact ? ' performance-chart-compact' : ''}`}>
      {!compact && (
        <div className="performance-chart-head">
          <h4>📊 {t('muro.chartTitle')}</h4>
          <div className="performance-chart-actions">
            <PlayerSearchInput
              players={evolution}
              value={selected}
              onChange={setSelected}
            />
            <button
              type="button"
              className="share-history-btn chart-share-btn"
              onClick={handleShare}
              disabled={exporting || !points.length}
            >
              {exporting ? t('sharePlayer.generating') : t('sharePlayer.export')}
            </button>
          </div>
        </div>
      )}

      {limited && !compact && (
        <p className="performance-chart-limit">
          <Trans i18nKey="muro.chartLimit" components={{ 1: <strong /> }} />
        </p>
      )}

      <div className="performance-chart-canvas">
        <ResponsiveContainer width="100%" height={compact ? 220 : 260}>
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

      <div className="share-player-export-stage" aria-hidden="true">
        <SharePlayerChartCard
          ref={exportRef}
          playerName={selected}
          pos={chartPlayer?.pos || ''}
          careerName={career?.name || ''}
          careerTotals={careerTotals}
          points={points}
          gk={gk}
        />
      </div>
    </div>
  );

  if (isPro) return chart;

  return (
    <ProFeatureGate
      locked={limited}
      label={t('muro.chartLocked')}
      onUnlock={() => setShowPremiumModal(true)}
    >
      {chart}
    </ProFeatureGate>
  );
}
