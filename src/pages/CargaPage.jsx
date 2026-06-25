import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CareerSelector from '../components/CareerSelector';
import EmptyCareerState from '../components/EmptyCareerState';
import OnboardingGuide from '../components/OnboardingGuide';
import { prepareImagesForUpload, processScreenshots } from '../utils/processScreenshots';
import { seasonLabel } from '../utils/seasonUtils';
import LandingHero from '../components/LandingHero';
import { usePageMeta } from '../hooks/usePageMeta';

const LOADING_STEPS = [
  'Leyendo Menú de plantilla...',
  'Extrayendo goleadores y asistentes...',
  'Calculando porterías a cero...',
  'Generando crónica deportiva...',
];

export default function CargaPage() {
  usePageMeta({ path: '/' });

  const navigate = useNavigate();
  const {
    welcomeDismissed,
    dismissWelcome,
    hasCareer,
    career,
    activeCareer,
    activeSeason,
    setLoading,
    setLoadingText,
    setLoadingSteps,
    applyProcessedSeason,
    showError,
  } = useApp();

  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [processMode, setProcessMode] = useState('new');
  const [replaceSeasonId, setReplaceSeasonId] = useState('');
  const fileRef = useRef(null);

  const hasSeasons = career?.seasons?.length > 0;
  const replaceTarget = career?.seasons?.find((s) => s.id === replaceSeasonId);

  useEffect(() => {
    if (!hasSeasons) {
      setProcessMode('new');
      setReplaceSeasonId('');
      return;
    }
    const preferred = activeSeason !== 'total'
      ? activeSeason
      : career.seasons[career.seasons.length - 1].id;
    setReplaceSeasonId(preferred);
  }, [career?.id, hasSeasons, activeSeason, career?.seasons]);

  const addFiles = (files) => {
    const imgs = [...files].filter((f) => f.type.startsWith('image/'));
    if (!imgs.length) return;
    let pending = imgs.length;
    const newUrls = [];
    imgs.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newUrls.push(ev.target.result);
        pending--;
        if (pending === 0) setImages((prev) => [...prev, ...newUrls]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProcess = async () => {
    if (!career) return;

    if (processMode === 'replace') {
      if (!replaceSeasonId || !replaceTarget) return;
      if (!window.confirm(
        `¿Reemplazar ${replaceTarget.label} con las nuevas capturas? Se sobrescribirán sus estadísticas.`,
      )) return;
    }

    setLoading(true);
    setLoadingText(LOADING_STEPS[0]);
    setLoadingSteps('La primera carga puede tardar ~1 min (servidor despertando). No cierres la app.');

    try {
      setLoadingText('Preparando capturas...');
      setLoadingSteps(`Comprimiendo ${images.length} imagen(es)...`);

      const compressed = await prepareImagesForUpload(images);

      setLoadingText('Leyendo capturas...');
      setLoadingSteps(`Analizando ${compressed.length} captura(s) de ${career.name}...`);

      const data = await processScreenshots(compressed, career.name);

      setLoadingText('Generando crónica deportiva...');
      applyProcessedSeason(activeCareer, data.players, {
        replaceSeasonId: processMode === 'replace' ? replaceSeasonId : null,
      });
      setImages([]);
      navigate('/periodico');
    } catch (err) {
      showError(err.message || 'No se pudieron leer las capturas');
    } finally {
      setLoading(false);
    }
  };

  const processLabel = processMode === 'replace' && replaceTarget
    ? `🔄 Reemplazar ${replaceTarget.label}`
    : `⚡ Procesar${hasSeasons ? ` (${seasonLabel(career.seasons.length + 1)})` : ''}`;

  return (
    <div className="page">
      {!hasCareer && <LandingHero />}

      {!welcomeDismissed && hasCareer && (
        <div className="welcome-banner">
          <div>
            <h3>👋 ¡Bienvenido a Legends Tracker!</h3>
            <p>
              Tu complemento para <strong>Modo Carrera</strong>: sube capturas de EA FC, genera
              crónicas y compara tus leyendas con la historia del club.
            </p>
          </div>
          <button className="welcome-close" onClick={dismissWelcome}>✕</button>
        </div>
      )}

      <CareerSelector showFreeTag />

      {!hasCareer ? (
        <EmptyCareerState />
      ) : (
        <>
          {!hasSeasons ? (
            <OnboardingGuide />
          ) : (
            <div className="season-process-mode">
              <p className="season-process-title">¿Qué quieres hacer con estas capturas?</p>
              <div className="season-process-options">
                <label className={`season-process-option ${processMode === 'new' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="processMode"
                    value="new"
                    checked={processMode === 'new'}
                    onChange={() => setProcessMode('new')}
                  />
                  <span>
                    <strong>Nueva temporada</strong>
                    <small>Crear {seasonLabel(career.seasons.length + 1)}</small>
                  </span>
                </label>
                <label className={`season-process-option ${processMode === 'replace' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="processMode"
                    value="replace"
                    checked={processMode === 'replace'}
                    onChange={() => setProcessMode('replace')}
                  />
                  <span>
                    <strong>Reemplazar temporada</strong>
                    <small>Sobrescribir datos de una existente</small>
                  </span>
                </label>
              </div>
              {processMode === 'replace' && (
                <select
                  className="season-replace-select"
                  value={replaceSeasonId}
                  onChange={(e) => setReplaceSeasonId(e.target.value)}
                >
                  {career.seasons.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div
            className={`upload-zone ${dragOver ? 'dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
          >
            <div className="icon">📸</div>
            <h3>Arrastra tus capturas de EA FC aquí</h3>
            <p>o toca aquí para elegir fotos de la galería (JPG, PNG) — varias a la vez</p>

            {images.length > 0 && (
              <div className="upload-preview visible">
                <div className="upload-grid">
                  {images.map((src, i) => (
                    <img key={i} className="upload-thumb" src={src} alt={`Captura ${i + 1}`} />
                  ))}
                </div>
                <div className="upload-count">
                  {images.length} captura{images.length !== 1 ? 's' : ''} lista{images.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          />

          <p className="cold-start-hint">
            Si la app lleva un rato sin usarse, el procesado puede tardar hasta 1 minuto la primera vez.
          </p>

          <button
            className={`process-btn ${processMode === 'replace' ? 'replace' : ''}`}
            disabled={!images.length || (processMode === 'replace' && !replaceSeasonId)}
            onClick={handleProcess}
          >
            {processLabel}
          </button>
        </>
      )}
    </div>
  );
}
