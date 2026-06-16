import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function CreateCareerModal() {
  const { showCreateModal, setShowCreateModal, createCareer } = useApp();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');

  if (!showCreateModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createCareer(name, subtitle);
    setName('');
    setSubtitle('');
  };

  return (
    <div className="modal-overlay visible" onClick={() => setShowCreateModal(false)}>
      <div className="modal create-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
        <div className="crown">⚽</div>
        <h2>Nueva Carrera</h2>
        <p>Escribe el nombre de tu equipo y empieza a registrar estadísticas de tu Modo Carrera.</p>

        <form onSubmit={handleSubmit} className="create-form">
          <label>
            Nombre del equipo *
            <input
              type="text"
              placeholder="Ej: A.S. Roma, Pisa S.C., Inter de Milán..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <label>
            Apodo / subtítulo (opcional)
            <input
              type="text"
              placeholder="Ej: La Loba Capitalina, Jóvenes Promesas..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </label>
          <button type="submit" className="modal-btn-primary" disabled={!name.trim()}>
            Crear Carrera
          </button>
        </form>
      </div>
    </div>
  );
}
