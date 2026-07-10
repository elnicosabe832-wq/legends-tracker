import { useState, lazy, Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import CareerSelector from '../components/CareerSelector';
import EmptyCareerState from '../components/EmptyCareerState';
import SeasonTabs from '../components/SeasonTabs';
import ClubSelector from '../components/ClubSelector';
import RealLifeCompare from '../components/RealLifeCompare';
import EvolutionPanel from '../components/EvolutionPanel';
import HallOfFamePanel from '../components/HallOfFamePanel';
import ActiveSquadPanel from '../components/ActiveSquadPanel';
import { getSeasonData, buildRankings, getPlayerMovers, seasonLabel, seasonNumFromId } from '../utils/seasonUtils';
import { countLicensedClubs } from '../data/eaFcDatabase';
import { getClubRecords, countClubsWithRecords } from '../data/clubRecords';
import { usePageMeta } from '../hooks/usePageMeta';

const PlayerPerformanceChart = lazy(() => import('../components/PlayerPerformanceChart'));

const POS_CLASS = ['gold', 'silver', 'bronze', 'normal'];
const LICENSED_COUNT = countLicensedClubs();
const RECORDS_COUNT = countClubsWithRecords();

function resolveSeasonLabel(career, activeSeason, seasonData) {
  if (activeSeason === 'total') return seasonData.label;
  const s = career.seasons.find((x) => x.id === activeSeason);
  const num = seasonNumFromId(s?.id);
  return num ? seasonLabel(num) : seasonData.label;
}

export default function MuroPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t('nav.wall'), path: '/muro' });

  const {
    career,
    activeSeason,
    hasCareer,
    isPro,
    isDemoMode,
    activeCareer,
    setShowPremiumModal,
    linkClub,
    unlinkClub,
  } = useApp();

  const [muroTab, setMuroTab] = useState('rankings');
  const [pendingSelection, setPendingSelection] = useState(null);

  if (!hasCareer) {
    return (
      <div className="page">
        <CareerSelector />
        <EmptyCareerState
          title={t('career.noCareerTitle')}
          description={t('career.noCareerWall')}
        />
      </div>
    );
  }

  const seasonData = getSeasonData(career, activeSeason);
  const displayLabel = resolveSeasonLabel(career, activeSeason, seasonData);
  const hasData = seasonData?.players?.length > 0;
  const isTotal = activeSeason === 'total';
  const showEvolution = isTotal && career.seasons.length > 1;
  const evolutionInsights = seasonData?.chronicle?.insights;
  const playerMovers = showEvolution ? getPlayerMovers(career.seasons) : null;

  const hasRecords = career.linkedClub
    ? getClubRecords(career.linkedClub.clubId).length > 0
    : (career.realLife?.length > 0);

  const openSalonTab = () => {
    if (!isPro && !isDemoMode) {
      setShowPremiumModal(true);
      return;
    }
    setMuroTab('salon');
  };

  const openHistoriaTab = () => {
    if (!isPro) {
      setShowPremiumModal(true);
      return;
    }
    setMuroTab('historia');
  };

  const handleLinkClub = (selection) => {
    if (!isPro) {
      setShowPremiumModal(true);
      return;
    }
    linkClub(activeCareer, selection);
    setPendingSelection(null);
  };

  if (!hasData) {
    return (
      <div className="page">
        <CareerSelector />
        <EmptyCareerState
          title={t('career.noStatsTitle')}
          description={t('career.noStatsDescription')}
        />
      </div>
    );
  }

  const rankings = buildRankings(seasonData.players);
  const rankingCards = [
    { cls: 'goals', title: `⚽ ${t('muro.topScorers')}`, items: rankings.goals },
    { cls: 'assists', title: `🎯 ${t('muro.topAssists')}`, items: rankings.assists },
    { cls: 'matches', title: `📋 ${t('muro.mostMatches')}`, items: rankings.matches },
    { cls: 'clean', title: `🧤 ${t('muro.cleanSheets')}`, items: rankings.cleanSheets },
  ];

  return (
    <div className="page">
      <CareerSelector showDelete />

      <div className="muro-title">
        <h2>
          <Trans i18nKey="muro.title" components={{ 1: <span className="green" />, 2: <span className="blue" /> }} />
        </h2>
        <p>{t('muro.subtitle', {
          label: displayLabel,
          name: career.name,
          subtitle: career.subtitle,
        })}
        </p>
      </div>

      <div className="muro-tabs">
        <button
          type="button"
          className={`muro-tab ${muroTab === 'rankings' ? 'active' : ''}`}
          onClick={() => setMuroTab('rankings')}
        >
          🏆 {t('muro.rankings')}
        </button>
        <button
          type="button"
          className={`muro-tab muro-tab-pro ${muroTab === 'salon' ? 'active' : ''}`}
          onClick={openSalonTab}
        >
          👑 {t('muro.hallOfFame')}
          {!isPro && <span className="muro-tab-lock">PRO</span>}
        </button>
        <button
          type="button"
          className={`muro-tab muro-tab-pro ${muroTab === 'historia' ? 'active' : ''}`}
          onClick={openHistoriaTab}
        >
          ⚖️ {t('muro.realHistory')}
          {!isPro && <span className="muro-tab-lock">PRO</span>}
        </button>
      </div>

      {muroTab === 'rankings' && (
        <>
          <SeasonTabs />

          <ActiveSquadPanel
            career={career}
            onRetired={() => setMuroTab('salon')}
          />

          {showEvolution && (
            <>
              <EvolutionPanel
                insights={evolutionInsights}
                movers={playerMovers}
                showMovers
              />
              <Suspense fallback={<p className="chart-loading">{t('common.loadingCharts')}</p>}>
                <PlayerPerformanceChart seasons={career.seasons} />
              </Suspense>
            </>
          )}

          <div className="rankings-grid">
            {rankingCards.map((rk) => (
              <div key={rk.cls} className={`ranking-card ${rk.cls}`}>
                <h3>{rk.title}</h3>
                {rk.items.map((item, i) => (
                  <div key={item.name} className="ranking-item">
                    <div className={`ranking-pos ${POS_CLASS[i]}`}>{i + 1}</div>
                    <div className="ranking-info">
                      <div className="player">{item.name}</div>
                      <div className="detail">{item.pos} · {item.matches} {t('common.matchesPlayed')}</div>
                    </div>
                    <div className="ranking-value">{item.value}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {hasRecords && isPro && (
            <button
              type="button"
              className="compare-btn"
              onClick={() => setMuroTab('historia')}
            >
              🏅 {t('muro.compareRecords')}
            </button>
          )}
        </>
      )}

      {muroTab === 'salon' && (
        <HallOfFamePanel career={career} />
      )}

      {muroTab === 'historia' && isPro && (
        <div className="historia-panel">
          <SeasonTabs />

          <div className="historia-intro">
            <div className="historia-intro-icon">👑</div>
            <div>
              <h3>{t('muro.historiaTitle')}</h3>
              <p>
                <Trans i18nKey="muro.historiaDesc" components={{ 1: <strong /> }} />
              </p>
              <span className="historia-db-badge">
                {t('muro.historiaBadge', { clubs: LICENSED_COUNT, records: RECORDS_COUNT })}
              </span>
            </div>
          </div>

          {career.linkedClub ? (
            <div className="linked-club-card">
              <div className="linked-club-info">
                <span className="linked-club-label">{t('muro.linkedClub')}</span>
                <strong>{career.linkedClub.clubName}</strong>
                <span className="linked-club-meta">
                  {career.linkedClub.leagueName} · {career.linkedClub.countryName}
                </span>
              </div>
              <button type="button" className="linked-club-change" onClick={unlinkClub}>
                {t('muro.changeClub')}
              </button>
            </div>
          ) : (
            <ClubSelector
              value={pendingSelection}
              onChange={setPendingSelection}
              onConfirm={handleLinkClub}
            />
          )}

          <RealLifeCompare career={career} seasonData={seasonData} />
        </div>
      )}
    </div>
  );
}
