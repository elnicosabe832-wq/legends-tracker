import { useApp } from '../context/AppContext';

export default function LoadingOverlay() {
  const { loading, loadingText, loadingSteps } = useApp();
  if (!loading) return null;

  return (
    <div className="loading-overlay visible">
      <div className="spinner" />
      <div className="loading-text">{loadingText}</div>
      <div className="loading-steps">{loadingSteps}</div>
    </div>
  );
}
