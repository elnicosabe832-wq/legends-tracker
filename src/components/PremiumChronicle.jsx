import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useApp } from '../context/AppContext';

export default function PremiumChronicle({
  chronicle,
  careerName,
  seasonLabel,
  seasonCount,
}) {
  const { isPro, setShowPremiumModal } = useApp();
  const ref = useRef(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!isPro) {
      setShowPremiumModal(true);
      return;
    }
    if (!ref.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#0a0e17',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `legends-tracker-${careerName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      /* silent */
    } finally {
      setExporting(false);
    }
  };

  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="premium-chronicle-wrap">
      <div className="premium-chronicle-toolbar">
        <span className="premium-chronicle-label">Edición Premium</span>
        <button
          type="button"
          className={`premium-export-btn${!isPro ? ' locked' : ''}`}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Generando...' : (isPro ? '📸 Exportar para redes' : '🔒 Exportar (Pro)')}
        </button>
      </div>

      <div ref={ref} className="premium-chronicle">
        <div className="premium-chronicle-masthead">
          <span className="premium-chronicle-kicker">Legends Tracker · Prensa Deportiva</span>
          <h2 className="premium-chronicle-title">THE DAILY LEGEND</h2>
          <div className="premium-chronicle-meta">
            <span>{careerName}</span>
            <span>{seasonLabel}</span>
            <span>{today}</span>
          </div>
        </div>

        <h3 className="premium-chronicle-headline">{chronicle.headline}</h3>

        <div className="premium-chronicle-columns">
          <div className="premium-chronicle-body">
            {chronicle.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="premium-chronicle-sidebar">
            <h4>Datos clave</h4>
            {chronicle.sidebar.map((s) => (
              <div key={s.label} className="premium-chronicle-stat">
                <span className="stat-label">{s.label}</span>
                <strong>{s.name}</strong>
                <span className="stat-value">{s.value}</span>
              </div>
            ))}
            {seasonCount > 1 && (
              <p className="premium-chronicle-foot">
                {seasonCount} temporadas documentadas en Legends Tracker
              </p>
            )}
          </aside>
        </div>

        <div className="premium-chronicle-brand">
          legends-tracker-five.vercel.app
        </div>
      </div>
    </div>
  );
}
