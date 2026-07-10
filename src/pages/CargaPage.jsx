import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import CareerSelector from '../components/CareerSelector';
import EmptyCareerState from '../components/EmptyCareerState';
import OnboardingGuide from '../components/OnboardingGuide';
import { prepareImagesForUpload, processScreenshots } from '../utils/processScreenshots';
import { seasonLabel } from '../utils/seasonUtils';
import LandingHero from '../components/LandingHero';
import { usePageMeta } from '../hooks/usePageMeta';

export default function CargaPage() {
  const { t } = useTranslation();
  usePageMeta({ path: '/' });

  const LOADING_STEPS = useMemo(() => [
    t('carga.loadingStep1'),
    t('carga.loadingStep2'),
    t('carga.loadingStep3'),
    t('carga.loadingStep4'),
  ], [t]);

  const navigate = useNavigate();
  const {
    welcomeDismissed,
    isDemoMode,
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
      const label = seasonLabel(parseInt(replaceSeasonId.replace('s', ''), 10));
      if (!window.confirm(t('carga.replaceConfirm', { label }))) return;
    }

    setLoading(true);
    setLoadingText(LOADING_STEPS[0]);
    setLoadingSteps(t('carga.loadingColdStart'));

    try {
      setLoadingText(t('carga.preparing'));
      setLoadingSteps(t('carga.compressing', { count: images.length }));

      const compressed = await prepareImagesForUpload(images);

      setLoadingText(t('carga.loadingStep1'));
      setLoadingSteps(t('carga.analyzing', { count: compressed.length, team: career.name }));

      const data = await processScreenshots(compressed, career.name);

      setLoadingText(t('carga.generating'));
      applyProcessedSeason(activeCareer, data.players, {
        replaceSeasonId: processMode === 'replace' ? replaceSeasonId : null,
      });
      setImages([]);
      navigate('/periodico');
    } catch (err) {
      showError(err.message || t('carga.errorProcess'));
    } finally {
      setLoading(false);
    }
  };

  const nextSeasonLabel = hasSeasons ? seasonLabel(career.seasons.length + 1) : '';
  const replaceLabel = replaceTarget
    ? seasonLabel(parseInt(replaceTarget.id.replace('s', ''), 10))
    : replaceTarget?.label;

  const processLabel = processMode === 'replace' && replaceTarget
    ? `🔄 ${t('carga.replace', { label: replaceLabel })}`
    : `⚡ ${t('carga.process')}${hasSeasons ? ` (${nextSeasonLabel})` : ''}`;

  return (
    <div className="page">
      {!hasCareer && <LandingHero />}

      {isDemoMode && (
        <p className="demo-carga-hint">{t('demo.cargaHint')}</p>
      )}

      {!welcomeDismissed && hasCareer && !isDemoMode && (
        <div className="welcome-banner">
          <div>
            <h3>👋 {t('carga.welcomeTitle')}</h3>
            <p>
              <Trans i18nKey="carga.welcomeText" components={{ 1: <strong /> }} />
            </p>
          </div>
          <button className="welcome-close" onClick={dismissWelcome}>✕</button>
        </div>
      )}

      <CareerSelector showFreeTag />

      {!hasCareer ? (
        <EmptyCareerState />
      ) : isDemoMode ? (
        <div className="demo-carga-cta">
          <p>{t('demo.hasSeasons')}</p>
          <button type="button" className="landing-link-btn" onClick={() => navigate('/periodico')}>
            {t('demo.viewNewspaper')}
          </button>
          <button type="button" className="landing-link-btn" onClick={() => navigate('/muro')}>
            {t('demo.viewWall')}
          </button>
        </div>
      ) : (
        <>
          {!hasSeasons ? (
            <OnboardingGuide />
          ) : (
            <div className="season-process-mode">
              <p className="season-process-title">{t('carga.processTitle')}</p>
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
                    <strong>{t('carga.newSeason')}</strong>
                    <small>{t('carga.newSeasonHint', { season: nextSeasonLabel })}</small>
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
                    <strong>{t('carga.replaceSeason')}</strong>
                    <small>{t('carga.replaceSeasonHint')}</small>
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
                    <option key={s.id} value={s.id}>
                      {seasonLabel(parseInt(s.id.replace('s', ''), 10))}
                    </option>
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
            <h3>{t('carga.uploadTitle')}</h3>
            <p>{t('carga.uploadHint')}</p>

            {images.length > 0 && (
              <div className="upload-preview visible">
                <div className="upload-grid">
                  {images.map((src, i) => (
                    <img key={i} className="upload-thumb" src={src} alt={t('carga.screenshotAlt', { num: i + 1 })} />
                  ))}
                </div>
                <div className="upload-count">
                  {t('carga.screenshotsReady', { count: images.length })}
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

          <p className="cold-start-hint">{t('carga.coldStart')}</p>

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
