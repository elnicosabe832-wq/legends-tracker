import { useState, useMemo } from 'react';
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
import { getPlayerEvolutionList, buildChartSeries } from '../utils/chartUtils';
import ProFeatureGate from './ProFeatureGate';

const CHART_THEME = {
  grid: '#1e293b',
  text: '#94a3b8',
  goals: '#00ff88',
  assists: '#00d4ff',
  rating: '#ffd700',
};

export default function PlayerPerformanceChart({ seasons }) {
  const { t } = useTranslation();
  const { isPro, setShowPremiumModal } = useApp();
  const evolution = useMemo(() => getPlayerEvolutionList(seasons), [seasons]);
  const [selected, setSelected] = useState(evolution[0]?.name || '');

  const { points, limited } = useMemo(
    () => buildChartSeries(seasons, selected, isPro),
    [seasons, selected, isPro],
  );

  if (evolution.length < 2) return null;

  const chart = (
    <div className="performance-chart">
      <div className="performance-chart-head">
        <h4>📊 {t('muro.chartTitle')}</h4>
        <select
          className="performance-chart-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {evolution
            .sort((a, b) => {
              const ga = a.history.reduce((s, h) => s + h.goals, 0);
              const gb = b.history.reduce((s, h) => s + h.goals, 0);
              return gb - ga;
            })
            .map((p) => (
              <option key={p.name} value={p.name}>{p.name} ({p.pos})</option>
            ))}
        </select>
      </div>

      {limited && (
        <p className="performance-chart-limit">
          <Trans i18nKey="muro.chartLimit" components={{ 1: <strong /> }} />
        </p>
      )}

      <div className="performance-chart-canvas">
        <ResponsiveContainer width="100%" height={260}>
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
              dataKey="rating"
              name={t('muro.chartRating')}
              stroke={CHART_THEME.rating}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
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
