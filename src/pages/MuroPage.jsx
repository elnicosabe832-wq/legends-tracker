import { useState } from 'react';
import { useApp } from '../context/AppContext';
import CareerSelector from '../components/CareerSelector';
import EmptyCareerState from '../components/EmptyCareerState';
import SeasonTabs from '../components/SeasonTabs';
import ClubSelector from '../components/ClubSelector';
import RealLifeCompare from '../components/RealLifeCompare';
import EvolutionPanel from '../components/EvolutionPanel';
import { getSeasonData, buildRankings, getPlayerMovers } from '../utils/seasonUtils';
import { countLicensedClubs } from '../data/eaFcDatabase';
import { getClubRecords, countClubsWithRecords } from '../data/clubRecords';

const POS_CLASS = ['gold', 'silver', 'bronze', 'normal'];
const LICENSED_COUNT = countLicensedClubs();
const RECORDS_COUNT = countClubsWithRecords();

export default function MuroPage() {
  const {
    career,
    activeSeason,
    hasCareer,
    isPro,
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
          title="Sin carrera activa"
          description="Crea un Modo Carrera y sube tus capturas para ver el Muro de Leyendas."
        />
      </div>
    );
  }

  const seasonData = getSeasonData(career, activeSeason);
  const hasData = seasonData?.players?.length > 0;
  const isTotal = activeSeason === 'total';
  const showEvolution = isTotal && career.seasons.length > 1;
  const evolutionInsights = seasonData?.chronicle?.insights;
  const playerMovers = showEvolution ? getPlayerMovers(career.seasons) : null;

  const hasRecords = career.linkedClub
    ? getClubRecords(career.linkedClub.clubId).length > 0
    : (career.realLife?.length > 0);

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
          title="Aún no hay estadísticas"
          description="Ve a Carga, sube capturas de EA FC y pulsa Procesar para llenar el Muro de Leyendas."
        />
      </div>
    );
  }

  const rankings = buildRankings(seasonData.players);
  const rankingCards = [
    { cls: 'goals', title: '⚽ Goleadores', items: rankings.goals },
    { cls: 'assists', title: '🎯 Asistentes', items: rankings.assists },
    { cls: 'matches', title: '📋 Más Partidos', items: rankings.matches },
    { cls: 'clean', title: '🧤 Porterías a Cero', items: rankings.cleanSheets },
  ];

  return (
    <div className="page">
      <CareerSelector showDelete />

      <div className="muro-title">
        <h2><span className="green">Muro</span> de <span className="blue">Leyendas</span></h2>
        <p>{seasonData.label} — {career.name} ({career.subtitle}) · Todas las competiciones</p>
      </div>

      <div className="muro-tabs">
        <button
          type="button"
          className={`muro-tab ${muroTab === 'rankings' ? 'active' : ''}`}
          onClick={() => setMuroTab('rankings')}
        >
          🏆 Rankings
        </button>
        <button
          type="button"
          className={`muro-tab muro-tab-pro ${muroTab === 'historia' ? 'active' : ''}`}
          onClick={openHistoriaTab}
        >
          ⚖️ Historia Real
          {!isPro && <span className="muro-tab-lock">PRO</span>}
        </button>
      </div>

      {muroTab === 'rankings' && (
        <>
          <SeasonTabs />

          {showEvolution && (
            <EvolutionPanel
              insights={evolutionInsights}
              movers={playerMovers}
              showMovers
            />
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
                      <div className="detail">{item.pos} · {item.matches} PJ</div>
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
              🏅 Comparar con Récords Reales
            </button>
          )}
        </>
      )}

      {muroTab === 'historia' && isPro && (
        <div className="historia-panel">
          <SeasonTabs />

          <div className="historia-intro">
            <div className="historia-intro-icon">👑</div>
            <div>
              <h3>Comparación con la historia real</h3>
              <p>
                Función <strong>Pro</strong>: vincula el club de EA FC con el que juegas en Modo Carrera
                y compara tus estadísticas con los récords históricos del equipo.
              </p>
              <span className="historia-db-badge">
                {LICENSED_COUNT}+ clubes EA FC · {RECORDS_COUNT} con récords históricos
              </span>
            </div>
          </div>

          {career.linkedClub ? (
            <div className="linked-club-card">
              <div className="linked-club-info">
                <span className="linked-club-label">Club vinculado</span>
                <strong>{career.linkedClub.clubName}</strong>
                <span className="linked-club-meta">
                  {career.linkedClub.leagueName} · {career.linkedClub.countryName}
                </span>
              </div>
              <button type="button" className="linked-club-change" onClick={unlinkClub}>
                Cambiar club
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
