export default function RetireToHallModal({ player, onConfirm, onCancel }) {
  if (!player) return null;

  return (
    <div className="modal-overlay visible" onClick={onCancel}>
      <div className="modal retire-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onCancel}>✕</button>
        <div className="retire-modal-icon">👑</div>
        <h2>Retirar al Salón de la Fama</h2>
        <p className="retire-modal-text">
          ¿Quieres inmortalizar a <strong>{player.name}</strong> en el Salón de la Fama?
        </p>
        <p className="retire-modal-sub">
          Sus estadísticas totales acumuladas hasta este momento se congelarán históricamente
          ({player.goals} goles · {player.assists} asistencias · {player.matches} PJ)
          y dejará de aparecer en la plantilla activa.
        </p>
        <div className="modal-actions premium-modal-actions">
          <button type="button" className="modal-btn-primary" onClick={onConfirm}>
            Inmortalizar leyenda
          </button>
          <button type="button" className="modal-btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
