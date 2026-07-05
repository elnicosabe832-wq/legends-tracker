export default function ProFeatureGate({
  children,
  locked,
  label = 'Función Pro',
  onUnlock,
  className = '',
}) {
  if (!locked) return children;

  return (
    <div className={`pro-feature-gate ${className}`}>
      <div className="pro-feature-gate-content pro-feature-gate-blur">
        {children}
      </div>
      <button type="button" className="pro-feature-gate-overlay" onClick={onUnlock}>
        <span className="pro-feature-gate-lock">🔒</span>
        <strong>{label}</strong>
        <span className="pro-feature-gate-cta">Desbloquear con Pro</span>
      </button>
    </div>
  );
}
