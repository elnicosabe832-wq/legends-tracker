import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  getStoredReferralCode,
  setStoredReferralCode,
  normalizeReferralCode,
} from '../lib/referrals';
import { validateReferralCode } from '../lib/referralApi';

const PRO_BENEFITS = [
  'Carreras ilimitadas',
  'Historia Real — compara con récords del club',
  'Salón de la Fama — inmortaliza leyendas',
  'Retos de carrera — reglas especiales para tu save',
  'Gráficos de evolución completos (15 temporadas)',
  'Exportar crónicas premium para redes',
];

export default function PremiumModal() {
  const {
    showPremiumModal,
    setShowPremiumModal,
    startProCheckout,
    proBusy,
    user,
    setShowAuthModal,
  } = useApp();

  const [referralCode, setReferralCode] = useState('');
  const [referralHint, setReferralHint] = useState('');
  const [referralValid, setReferralValid] = useState(null);

  useEffect(() => {
    if (!showPremiumModal) return;
    setReferralCode(getStoredReferralCode());
    setReferralHint('');
    setReferralValid(null);
  }, [showPremiumModal]);

  if (!showPremiumModal) return null;

  const handleReferralChange = (value) => {
    const next = normalizeReferralCode(value);
    setReferralCode(next);
    setStoredReferralCode(next);
    setReferralHint('');
    setReferralValid(null);
  };

  const handleReferralBlur = async () => {
    if (!referralCode) {
      setReferralHint('');
      setReferralValid(null);
      return;
    }
    try {
      const result = await validateReferralCode(referralCode);
      if (result.valid) {
        setReferralValid(true);
        setReferralHint(result.displayName ? `Código de ${result.displayName}` : 'Código válido');
      } else {
        setReferralValid(false);
        setReferralHint(result.message || 'Código no válido');
      }
    } catch {
      setReferralValid(null);
      setReferralHint('');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setShowPremiumModal(false);
      setShowAuthModal(true);
      return;
    }
    startProCheckout(referralCode);
  };

  return (
    <div className="modal-overlay visible" onClick={() => setShowPremiumModal(false)}>
      <div className="modal premium-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowPremiumModal(false)}>✕</button>
        <div className="crown">👑</div>
        <h2>No dejes que tu historia se borre</h2>
        <p className="premium-modal-lead">
          Convierte tu Modo Carrera en una <strong>leyenda eterna</strong> por menos de un café al mes.
        </p>

        <ul className="premium-benefits">
          {PRO_BENEFITS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <div className="price">1,99€<span>/mes</span></div>

        <label className="referral-field">
          <span className="referral-label">Código de creador (opcional)</span>
          <input
            type="text"
            className={`referral-input${referralValid === true ? ' valid' : ''}${referralValid === false ? ' invalid' : ''}`}
            placeholder="Ej. TORRE4"
            value={referralCode}
            maxLength={32}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => handleReferralChange(e.target.value)}
            onBlur={handleReferralBlur}
          />
          {referralHint && (
            <span className={`referral-hint${referralValid === false ? ' error' : ''}`}>
              {referralHint}
            </span>
          )}
        </label>

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
            disabled={proBusy || referralValid === false}
          >
            {proBusy ? 'Redirigiendo...' : (user ? 'Hacerse Pro' : 'Entrar y hacerse Pro')}
          </button>
          <button className="modal-btn-secondary" onClick={() => setShowPremiumModal(false)}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
