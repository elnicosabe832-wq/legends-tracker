import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { aggregatePlayers, seasonLabel, seasonNumFromId } from '../utils/seasonUtils';
import {
  getPlayerProfile,
  profileBadgeParts,
  profileHasData,
} from '../utils/playerProfileUtils';
import RetireToHallModal from './RetireToHallModal';
import PlayerProfileModal from './PlayerProfileModal';
import PlayerStatsModal from './PlayerStatsModal';

export default function ActiveSquadPanel({ career, onRetired }) {
  const { t } = useTranslation();
  const {
    isPro,
    isDemoMode,
    activeCareer,
    setShowPremiumModal,
    retirePlayerToHallOfFame,
    updatePlayerProfile,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(null);
  const [pendingRetire, setPendingRetire] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [viewingPlayer, setViewingPlayer] = useState(null);
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

  const handleEditClick = (player) => {
    setMenuOpen(null);
    setViewingPlayer(null);
    setEditingPlayer(player);
  };

  const handleViewStats = (player) => {
    setMenuOpen(null);
    setViewingPlayer(player);
  };

  const confirmRetire = (saleFee) => {
    if (!pendingRetire) return;
    retirePlayerToHallOfFame(activeCareer, pendingRetire.name, {
      saleFee: saleFee !== '' && saleFee != null ? saleFee : undefined,
    });
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
      <p className="active-squad-hint active-squad-hint-secondary">
        {t('playerProfile.squadHint')}
      </p>

      <ul className="active-squad-list">
        {squadPlayers.map((p) => {
          const profile = getPlayerProfile(career, p.name);
          const badges = profileBadgeParts(profile, t);
          return (
            <li key={p.name} className="active-squad-row">
              <button
                type="button"
                className="active-squad-player active-squad-player-btn"
                onClick={() => handleViewStats(p)}
                title={t('muro.viewPlayerStats')}
              >
                <strong>{p.name}</strong>
                <span>
                  {p.pos} · {p.goals}⚽ {p.assists}🎯 · {p.matches} {t('common.matchesPlayed')}
                </span>
                {badges.length > 0 && (
                  <span className="player-profile-badges">
                    {badges.map((b) => (
                      <span key={b} className="player-profile-badge">{b}</span>
                    ))}
                  </span>
                )}
              </button>
              <div className="active-squad-actions">
                <button
                  type="button"
                  className="squad-stats-btn"
                  title={t('muro.viewPlayerStats')}
                  onClick={() => handleViewStats(p)}
                >
                  📊
                </button>
                <button
                  type="button"
                  className="squad-edit-btn"
                  title={t('playerProfile.edit')}
                  onClick={() => handleEditClick(p)}
                >
                  {profileHasData(profile) ? '✏️' : '＋'} {t('playerProfile.editShort')}
                </button>
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
                      <button type="button" onClick={() => handleViewStats(p)}>
                        📊 {t('muro.viewPlayerStats')}
                      </button>
                      <button type="button" onClick={() => handleEditClick(p)}>
                        ✏️ {t('playerProfile.edit')}
                      </button>
                      <button type="button" onClick={() => handleRetireClick(p)}>
                        👑 {t('muro.retireMenu')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {!isPro && !isDemoMode && (
        <p className="active-squad-pro-note">{t('muro.proNote')}</p>
      )}

      <RetireToHallModal
        player={pendingRetire}
        career={career}
        onConfirm={confirmRetire}
        onCancel={() => setPendingRetire(null)}
      />

      <PlayerProfileModal
        player={editingPlayer}
        career={career}
        onSave={(name, profile) => updatePlayerProfile(activeCareer, name, profile)}
        onClose={() => setEditingPlayer(null)}
      />

      <PlayerStatsModal
        player={viewingPlayer}
        career={career}
        onClose={() => setViewingPlayer(null)}
        onEditProfile={(p) => {
          setViewingPlayer(null);
          setEditingPlayer(p);
        }}
      />
    </section>
  );
}
