import { useApp } from '../context/AppContext';

export default function EmptyCareerState({ title, description }) {
  const { openCreateCareer, isPro, careerCount } = useApp();

  return (
    <div className="empty-career">
      <div className="empty-icon">🏟️</div>
      <h3>{title || 'Aún no tienes ningún Modo Carrera'}</h3>
      <p>
        {description || (
          <>
            Crea tu primera carrera para empezar a registrar goles, asistencias y leyendas.
            {!isPro && (
              <> Tu plan <strong>Gratis</strong> incluye <strong>1 carrera</strong>
                {careerCount === 0 ? ' (0/1 usada)' : ''}.</>
            )}
          </>
        )}
      </p>
      <button className="create-career-btn" onClick={openCreateCareer}>
        + Crear Nueva Carrera
      </button>
    </div>
  );
}
