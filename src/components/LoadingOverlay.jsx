import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const EMOTIONAL_MESSAGES = [
  'Leyendo los periódicos locales...',
  'Los redactores están escribiendo la crónica del partido...',
  'Actualizando el Salón de la Fama de tu club...',
  'Calculando promedios de tus estrellas...',
];

export default function LoadingOverlay() {
  const { loading, loadingText, loadingSteps } = useApp();

  useEffect(() => {
    if (!loading) return undefined;

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % EMOTIONAL_MESSAGES.length;
      const el = document.querySelector('.loading-steps-emotional');
      if (el) el.textContent = EMOTIONAL_MESSAGES[idx];
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="loading-overlay visible">
      <div className="spinner" />
      <div className="loading-text">{loadingText}</div>
      <div className="loading-steps">{loadingSteps}</div>
      <div className="loading-steps loading-steps-emotional">
        {EMOTIONAL_MESSAGES[0]}
      </div>
    </div>
  );
}
