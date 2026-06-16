export default function EvolutionPanel({ insights, movers, showMovers = false }) {
  if (!insights?.length && !movers?.risers?.length) return null;

  return (
    <div className="evolution-section evolution-section-muro">
      <h3>📈 Evolución del plantel</h3>
      <p className="evolution-subtitle">
        Comparativa entre temporadas — subidas, bajadas y proyección de leyendas
      </p>

      {insights?.length > 0 && (
        <div className="evolution-grid">
          {insights.map((item) => (
            <div key={item.title} className={`evolution-card evolution-${item.type}`}>
              <span className="evolution-icon">{item.icon}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      )}

      {showMovers && (movers?.risers?.length > 0 || movers?.fallers?.length > 0) && (
        <div className="movers-grid">
          {movers.risers.length > 0 && (
            <div className="movers-card movers-rise">
              <h4>🔥 En racha (último salto)</h4>
              {movers.risers.map((p) => (
                <div key={p.name} className="mover-row">
                  <div className="mover-info">
                    <span className="mover-name">{p.name}</span>
                    <span className="mover-detail">{p.pos} · {p.prevLabel} → {p.lastLabel}</span>
                  </div>
                  <div className="mover-stats">
                    <span className="mover-goals">{p.prevGoals} → {p.lastGoals} ⚽</span>
                    {p.goalsDelta !== 0 && (
                      <span className="mover-delta positive">+{p.goalsDelta}</span>
                    )}
                    {p.assistsDelta > 0 && (
                      <span className="mover-delta positive">+{p.assistsDelta} 🎯</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {movers.fallers.length > 0 && (
            <div className="movers-card movers-drop">
              <h4>❄️ En baja (último salto)</h4>
              {movers.fallers.map((p) => (
                <div key={p.name} className="mover-row">
                  <div className="mover-info">
                    <span className="mover-name">{p.name}</span>
                    <span className="mover-detail">{p.pos} · {p.prevLabel} → {p.lastLabel}</span>
                  </div>
                  <div className="mover-stats">
                    <span className="mover-goals">{p.prevGoals} → {p.lastGoals} ⚽</span>
                    {p.goalsDelta < 0 && (
                      <span className="mover-delta negative">{p.goalsDelta}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
