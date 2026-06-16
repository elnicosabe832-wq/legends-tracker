import { useApp } from '../context/AppContext';

export default function PremiumModal() {
  const {
    showPremiumModal,
    setShowPremiumModal,
    startProCheckout,
    proBusy,
    user,
    setShowAuthModal,
  } = useApp();

  if (!showPremiumModal) return null;

  const handleCheckout = () => {
    if (!user) {
      setShowPremiumModal(false);
      setShowAuthModal(true);
      return;
    }
    startProCheckout();
  };

  return (
    <div className="modal-overlay visible" onClick={() => setShowPremiumModal(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowPremiumModal(false)}>✕</button>
        <div className="crown">👑</div>
        <h2>¡Pásate a Pro!</h2>
        <p>
          Desbloquea <strong>carreras ilimitadas</strong> y la pestaña{' '}
          <strong>Historia Real</strong> del Muro de Leyendas: elige país, liga y club de EA FC
          y compara tus récords con la historia del equipo.
        </p>
        <div className="price">1,99€<span>/mes</span></div>
        <p className="premium-note">
          Pago seguro con Stripe. Cancela cuando quieras desde tu cuenta.
        </p>
        {!user && (
          <p className="premium-login-hint">Necesitas iniciar sesión antes de pagar.</p>
        )}
        <div className="modal-actions premium-modal-actions">
          <button
            className="modal-btn-primary"
            onClick={handleCheckout}
            disabled={proBusy}
          >
            {proBusy ? 'Redirigiendo...' : (user ? 'Pagar con Stripe' : 'Entrar y pagar')}
          </button>
          <button className="modal-btn-secondary" onClick={() => setShowPremiumModal(false)}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
