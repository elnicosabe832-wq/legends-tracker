import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { aggregatePlayers } from '../utils/seasonUtils';
import RetireToHallModal from './RetireToHallModal';

export default function ActiveSquadPanel({ career, onRetired }) {
  const {
    isPro,
    isDemoMode,
    activeCareer,
    setShowPremiumModal,
    retirePlayerToHallOfFame,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(null);
  const [pendingRetire, setPendingRetire] = useState(null);

  const seasons = career.seasons || [];
  if (!seasons.length) return null;

  const latestSeason = seasons[seasons.length - 1];
  const enshrined = new Set((career.hallOfFame || []).map((h) => h.snapshot.name));
  const totals = aggregatePlayers(seasons);

  const squadPlayers = (latestSeason.players || [])
    .filter((p) => !enshrined.has(p.name))
    .map((p) => {
      const total = totals.find((t) => t.name === p.name) || p;
      return { ...p, ...total, seasonLabel: latestSeason.label };
    })
    .sort((a, b) => b.goals - a.goals);

  if (!squadPlayers.length) return null;

  const handleRetireClick = (player) => {
    setMenuOpen(null);
    if (!isPro) {
      setShowPremiumModal(true);
      return;
    }
    const total = totals.find((t) => t.name === player.name) || player;
    setPendingRetire(total);
  };

  const confirmRetire = () => {
    if (!pendingRetire) return;
    retirePlayerToHallOfFame(activeCareer, pendingRetire.name);
    setPendingRetire(null);
    onRetired?.();
  };

  return (
    <section className="active-squad-panel">
      <div className="active-squad-head">
        <h3>👕 Plantilla activa</h3>
        <span className="active-squad-meta">{latestSeason.label} · {squadPlayers.length} jugadores</span>
      </div>
      <p className="active-squad-hint">
        Retira leyendas al Salón de la Fama cuando vendas o despides a un jugador en tu save.
      </p>

      <ul className="active-squad-list">
        {squadPlayers.map((p) => (
          <li key={p.name} className="active-squad-row">
            <div className="active-squad-player">
              <strong>{p.name}</strong>
              <span>{p.pos} · {p.goals}⚽ {p.assists}🎯 · {p.matches} PJ</span>
            </div>
            <div className="active-squad-actions">
              <button
                type="button"
                className="squad-retire-btn"
                title="Retirar al Salón de la Fama"
                onClick={() => handleRetireClick(p)}
              >
                👑 Retirar
              </button>
              <div className="squad-menu-wrap">
                <button
                  type="button"
                  className="squad-menu-btn"
                  aria-label="Opciones"
                  onClick={() => setMenuOpen(menuOpen === p.name ? null : p.name)}
                >
                  ⋯
                </button>
                {menuOpen === p.name && (
                  <div className="squad-menu-dropdown">
                    <button type="button" onClick={() => handleRetireClick(p)}>
                      👑 Retirar al Salón de la Fama
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!isPro && !isDemoMode && (
        <p className="active-squad-pro-note">Función Pro — prueba en la carrera de ejemplo o hazte Pro.</p>
      )}

      <RetireToHallModal
        player={pendingRetire}
        onConfirm={confirmRetire}
        onCancel={() => setPendingRetire(null)}
      />
    </section>
  );
}
