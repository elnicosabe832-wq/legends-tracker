import { useApp } from '../context/AppContext';

export default function CareerSelector({ showFreeTag = false, showDelete = false }) {
  const {
    userCareers,
    activeCareer,
    isPro,
    careerCount,
    handleCareerSelect,
    deleteCareer,
  } = useApp();
  const careers = Object.values(userCareers);

  return (
    <div className="career-selector">
      <label htmlFor="careerSelect">Carrera Activa:</label>
      <select
        id="careerSelect"
        className="career-select"
        value={activeCareer || '__create__'}
        onChange={(e) => handleCareerSelect(e.target.value)}
      >
        {careers.length === 0 ? (
          <option value="__create__">+ Crear Nueva Carrera</option>
        ) : (
          <>
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.subtitle})
              </option>
            ))}
            <option value="__create__">+ Crear Nueva Carrera</option>
          </>
        )}
      </select>
      {showFreeTag && (
        <span
          className="free-tag"
          style={
            isPro
              ? { background: 'rgba(255, 215, 0, 0.15)', color: 'var(--gold)' }
              : undefined
          }
        >
          {isPro ? 'PRO · Ilimitadas' : `GRATIS · ${careerCount}/1`}
        </span>
      )}
      {showDelete && activeCareer && (
        <button
          type="button"
          className="delete-career-btn"
          title="Eliminar carrera"
          onClick={() => deleteCareer(activeCareer)}
        >
          🗑️
        </button>
      )}
    </div>
  );
}
