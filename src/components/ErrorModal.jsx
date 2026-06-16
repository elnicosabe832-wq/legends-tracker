import { useApp } from '../context/AppContext';

export default function ErrorModal() {
  const { errorMessage, clearError } = useApp();
  if (!errorMessage) return null;

  return (
    <div className="modal-overlay visible" onClick={clearError}>
      <div className="modal error-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={clearError}>✕</button>
        <div className="crown">⚠️</div>
        <h2>No se pudo procesar</h2>
        <p className="error-text">{errorMessage}</p>
        <button type="button" className="modal-btn-primary" onClick={clearError}>
          Entendido
        </button>
      </div>
    </div>
  );
}
