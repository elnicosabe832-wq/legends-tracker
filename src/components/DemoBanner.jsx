import { useApp } from '../context/AppContext';

export default function DemoBanner() {
  const { isDemoMode, exitDemoCareer } = useApp();
  if (!isDemoMode) return null;

  return (
    <div className="demo-banner">
      <span>📋 Estás viendo una <strong>carrera de ejemplo</strong> con 5 temporadas.</span>
      <button type="button" className="demo-banner-exit" onClick={exitDemoCareer}>
        Salir del demo
      </button>
    </div>
  );
}
