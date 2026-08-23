import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { getClubRecords } from '../data/clubRecords';
import {
  buildClubChartSeries,
  buildClubMilestones,
  buildClubRecordsTrend,
  buildClubCareerTotals,
} from '../utils/chartUtils';
import ProFeatureGate from './ProFeatureGate';

const CHART_THEME = {
  grid: '#1e293b',
  text: '#94a3b8',
  goals: '#00ff88',
  assists: '#00d4ff',
  ga: '#ffd700',
  gaPerMatch: '#a78bfa',
};

export default function ClubPerformanceChart({ seasons, career }) {
  const { t } = useTranslation();
  const { isPro, setShowPremiumModal } = useApp();

  const { items: clubPoints, limited } = useMemo(
    () => buildClubChartSeries(seasons, isPro),
    [seasons, isPro],
  );

  const careerTotals = useMemo(
    () => buildClubCareerTotals(seasons),
    [seasons],
  );

  const milestones = useMemo(
    () => buildClubMilestones(seasons),
    [seasons],
  );

  const records = career?.linkedClub
    ? getClubRecords(career.linkedClub.clubId)
    : (career?.realLife ?? []);

  const { items: recordPoints } = useMemo(
    () => buildClubRecordsTrend(seasons, records, isPro),
    [seasons, records, isPro],
  );

  if (clubPoints.length < 2) return null;

  const chart = (
    <div className="performance-chart club-performance-chart">
      <div className="performance-chart-head">
        <h4>📈 {t('muro.clubChartTitle')}</h4>
      </div>

      {limited && (
        <p className="performance-chart-limit">
          <Trans i18nKey="muro.chartLimit" components={{ 1: <strong /> }} />
        </p>
      )}

      <div className="club-career-summary">
        <div className="club-career-stat">
          <strong>{careerTotals.totalGoals}</strong>
          <span>{t('muro.clubTotalGoals')}</span>
        </div>
        <div className="club-career-stat">
          <strong>{careerTotals.totalAssists}</strong>
          <span>{t('muro.clubTotalAssists')}</span>
        </div>
        <div className="club-career-stat highlight">
          <strong>{careerTotals.ga}</strong>
          <span>{t('muro.clubTotalGa')}</span>
        </div>
      </div>

      <div className="club-chart-panel club-chart-panel-full">
        <h5>{t('muro.clubEvolutionTitle')}</h5>
        <div className="performance-chart-canvas">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={clubPoints} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
                dataKey="totalGoals"
                name={t('muro.chartGoals')}
                stroke={CHART_THEME.goals}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="totalAssists"
                name={t('muro.chartAssists')}
                stroke={CHART_THEME.assists}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="club-chart-grid">
        <div className="club-chart-panel">
          <h5>{t('muro.clubGaPerMatch')}</h5>
          <div className="performance-chart-canvas">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={clubPoints} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
                  dataKey="gaPerMatch"
                  name={t('muro.clubGaPerMatchShort')}
                  stroke={CHART_THEME.gaPerMatch}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="club-chart-panel">
          <h5>{t('muro.clubSeasonCompare')}</h5>
          <div className="performance-chart-canvas">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={clubPoints} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
                <Bar dataKey="totalGoals" name={t('muro.chartGoals')} fill={CHART_THEME.goals} radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalAssists" name={t('muro.chartAssists')} fill={CHART_THEME.assists} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {milestones && (
        <div className="club-milestones">
          <h5>🏆 {t('muro.clubMilestones')}</h5>
          <div className="club-milestones-grid">
            <div className="club-milestone-card">
              <span className="club-milestone-label">{t('muro.milestoneBestGoals')}</span>
              <strong>{milestones.bestGoals.totalGoals}</strong>
              <span className="club-milestone-season">{milestones.bestGoals.season}</span>
            </div>
            <div className="club-milestone-card">
              <span className="club-milestone-label">{t('muro.milestoneBestAssists')}</span>
              <strong>{milestones.bestAssists.totalAssists}</strong>
              <span className="club-milestone-season">{milestones.bestAssists.season}</span>
            </div>
            <div className="club-milestone-card">
              <span className="club-milestone-label">{t('muro.milestoneBestGa')}</span>
              <strong>{milestones.bestGa.ga}</strong>
              <span className="club-milestone-season">{milestones.bestGa.season}</span>
            </div>
            <div className="club-milestone-card highlight">
              <span className="club-milestone-label">{t('muro.milestoneBestGaPerMatch')}</span>
              <strong>{milestones.bestGaPerMatch.gaPerMatch}</strong>
              <span className="club-milestone-season">{milestones.bestGaPerMatch.season}</span>
            </div>
          </div>
          {milestones.prev && milestones.deltaGa != null && (
            <p className="club-milestone-delta">
              {t('muro.milestoneDelta', {
                season: milestones.last.season,
                ga: milestones.last.ga,
                delta: milestones.deltaGa >= 0 ? `+${milestones.deltaGa}` : milestones.deltaGa,
                gaPerMatch: milestones.last.gaPerMatch,
                deltaGaPerMatch: milestones.deltaGaPerMatch >= 0
                  ? `+${milestones.deltaGaPerMatch}`
                  : milestones.deltaGaPerMatch,
              })}
            </p>
          )}
        </div>
      )}

      {records.length > 0 && recordPoints.length >= 2 && (
        <div className="club-records-trend">
          <h5>⚖️ {t('muro.clubRecordsTrend')}</h5>
          <div className="club-records-trend-grid">
            {records.slice(0, 4).map((rec) => (
              <div key={rec.stat} className="club-record-trend-card">
                <span className="club-record-trend-label">{rec.category}</span>
                <div className="club-record-trend-bars">
                  {recordPoints.map((pt) => {
                    const pct = pt[`${rec.stat}Pct`] || 0;
                    return (
                      <div key={pt.season} className="club-record-trend-row" title={`${pt.season}: ${pct}%`}>
                        <span>{pt.season}</span>
                        <div className="club-record-trend-bar-wrap">
                          <div
                            className={`club-record-trend-bar ${pct >= 50 ? 'high' : pct >= 20 ? 'mid' : 'low'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
