import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { aggregatePlayers, seasonLabel, seasonNumFromId } from '../utils/seasonUtils';
import RetireToHallModal from './RetireToHallModal';

export default function ActiveSquadPanel({ career, onRetired }) {
  const { t } = useTranslation();
  const {
    isPro,
    isDemoMode,
    activeCareer,
    setShowPremiumModal,
    retirePlayerToHallOfFame,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(null);
  const [pendingRetire, setPendingRetire] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const close = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const seasons = career.seasons || [];
  if (!seasons.length) return null;

  const latestSeason = seasons[seasons.length - 1];
  const seasonNum = seasonNumFromId(latestSeason.id) || seasons.length;
  const latestLabel = seasonLabel(seasonNum);
  const enshrined = new Set((career.hallOfFame || []).map((h) => h.snapshot.name));
  const totals = aggregatePlayers(seasons);

  const squadPlayers = (latestSeason.players || [])
    .filter((p) => !enshrined.has(p.name))
    .map((p) => {
      const total = totals.find((x) => x.name === p.name) || p;
      return { ...p, ...total, seasonLabel: latestLabel };
    })
    .sort((a, b) => b.goals - a.goals);

  if (!squadPlayers.length) {
    return (
      <section className="active-squad-panel active-squad-empty">
        <p className="active-squad-hint">{t('muro.squadEmpty')}</p>
      </section>
    );
  }

  const handleRetireClick = (player) => {
    setMenuOpen(null);
    if (!isPro) {
      setShowPremiumModal(true);
      return;
    }
    const total = totals.find((x) => x.name === player.name) || player;
    setPendingRetire(total);
  };

  const confirmRetire = () => {
    if (!pendingRetire) return;
    retirePlayerToHallOfFame(activeCareer, pendingRetire.name);
    setPendingRetire(null);
    onRetired?.();
  };

  return (
    <section className="active-squad-panel" ref={panelRef}>
      <div className="active-squad-head">
        <h3>👕 {t('muro.squadTitle')}</h3>
        <span className="active-squad-meta">
          {t('muro.squadMeta', { label: latestLabel, count: squadPlayers.length })}
        </span>
      </div>
      <p className="active-squad-hint">{t('muro.squadHint')}</p>

      <ul className="active-squad-list">
        {squadPlayers.map((p) => (
          <li key={p.name} className="active-squad-row">
            <div className="active-squad-player">
              <strong>{p.name}</strong>
              <span>
                {p.pos} · {p.goals}⚽ {p.assists}🎯 · {p.matches} {t('common.matchesPlayed')}
              </span>
            </div>
            <div className="active-squad-actions">
              <button
                type="button"
                className="squad-retire-btn"
                title={t('muro.retireMenu')}
                onClick={() => handleRetireClick(p)}
              >
                👑 {t('muro.retire')}
              </button>
              <div className="squad-menu-wrap">
                <button
                  type="button"
                  className="squad-menu-btn"
                  aria-label="Options"
                  aria-expanded={menuOpen === p.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === p.name ? null : p.name);
                  }}
                >
                  ⋯
                </button>
                {menuOpen === p.name && (
                  <div className="squad-menu-dropdown">
                    <button type="button" onClick={() => handleRetireClick(p)}>
                      👑 {t('muro.retireMenu')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!isPro && !isDemoMode && (
        <p className="active-squad-pro-note">{t('muro.proNote')}</p>
      )}

      <RetireToHallModal
        player={pendingRetire}
        onConfirm={confirmRetire}
        onCancel={() => setPendingRetire(null)}
      />
    </section>
  );
}
