import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function LoadingOverlay() {
  const { t, i18n } = useTranslation();
  const { loading, loadingText, loadingSteps } = useApp();

  const emotionalMessages = useMemo(() => [
    t('loading.emotional1'),
    t('loading.emotional2'),
    t('loading.emotional3'),
    t('loading.emotional4'),
  ], [t, i18n.language]);

  useEffect(() => {
    if (!loading) return undefined;

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % emotionalMessages.length;
      const el = document.querySelector('.loading-steps-emotional');
      if (el) el.textContent = emotionalMessages[idx];
    }, 2000);

    return () => clearInterval(interval);
  }, [loading, emotionalMessages]);

  if (!loading) return null;

  return (
    <div className="loading-overlay visible">
      <div className="spinner" />
      <div className="loading-text">{loadingText}</div>
      <div className="loading-steps">{loadingSteps}</div>
      <div className="loading-steps loading-steps-emotional">
        {emotionalMessages[0]}
      </div>
    </div>
  );
}
