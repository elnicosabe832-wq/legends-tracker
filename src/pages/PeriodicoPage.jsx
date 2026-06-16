import { useApp } from '../context/AppContext';
import CareerSelector from '../components/CareerSelector';
import EmptyCareerState from '../components/EmptyCareerState';
import SeasonTabs from '../components/SeasonTabs';
import EvolutionPanel from '../components/EvolutionPanel';
import { getSeasonData } from '../utils/seasonUtils';

export default function PeriodicoPage() {
  const { career, activeSeason, hasCareer } = useApp();

  if (!hasCareer) {
    return (
      <div className="page">
        <CareerSelector />
        <EmptyCareerState
          title="Sin carrera activa"
          description="Crea un Modo Carrera y sube tus capturas para generar la crónica deportiva."
        />
      </div>
    );
  }

  const seasonData = getSeasonData(career, activeSeason);
  if (!seasonData?.chronicle) {
    return (
      <div className="page">
        <CareerSelector />
        <EmptyCareerState
          title="Aún no hay datos"
          description="Ve a Carga, sube capturas de EA FC y pulsa Procesar para generar El Periódico."
        />
      </div>
    );
  }

  const { chronicle } = seasonData;
  const isTotal = activeSeason === 'total';
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="page">
      <CareerSelector showDelete />
      <SeasonTabs />
      <div className="newspaper">
        <div className="newspaper-header">
          <h1>El Periódico</h1>
          <div className="subtitle">
            Edición {career.name} — {seasonData.label}
            {isTotal && career.seasons.length > 1 && (
              <span className="newspaper-badge"> {career.seasons.length} temporadas</span>
            )}
          </div>
        </div>
        <div className="newspaper-date">{today}</div>
        <div className="newspaper-body">
          <div>
            <h2 className="headline">{chronicle.headline}</h2>
            <div className="article-text">
              {chronicle.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
          <div>
            <div className="sidebar-box">
              <h4>{isTotal ? '📊 Totales Históricos' : '📊 Datos Clave'}</h4>
              {chronicle.sidebar.map((s) => (
                <div key={s.label} className="sidebar-stat">
                  <span className="name">{s.label}: {s.name}</span>
                  <span className="value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isTotal && chronicle.insights?.length > 0 && (
          <EvolutionPanel insights={chronicle.insights} />
        )}
      </div>
    </div>
  );
}
