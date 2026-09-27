import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useApp } from '../context/AppContext';
import {
  getStoredReferralCode,
  setStoredReferralCode,
  normalizeReferralCode,
} from '../lib/referrals';
import { validateReferralCode } from '../lib/referralApi';

export default function PremiumModal() {
  const { t } = useTranslation();
  const {
    showPremiumModal,
    setShowPremiumModal,
    startProCheckout,
    prefetchProCheckout,
    proBusy,
    user,
    setShowAuthModal,
    trialAvailable,
  } = useApp();

  const [referralCode, setReferralCode] = useState('');
  const [referralHint, setReferralHint] = useState('');
  const [referralValid, setReferralValid] = useState(null);

  const benefits = t('premium.benefits', { returnObjects: true });
  // Por defecto ofrecemos trial; solo lo ocultamos si el backend dice explícitamente que no.
  const showTrial = trialAvailable !== false;

  useEffect(() => {
    if (!showPremiumModal) return;
    const stored = getStoredReferralCode();
    setReferralCode(stored);
    setReferralHint('');
    setReferralValid(null);
    // Mientras el usuario lee el modal, ya pedimos la URL de Stripe
    if (user) prefetchProCheckout(stored);
  }, [showPremiumModal, user, prefetchProCheckout]);

  if (!showPremiumModal) return null;

  const handleReferralChange = (value) => {
    const next = normalizeReferralCode(value);
    setReferralCode(next);
    setStoredReferralCode(next);
    setReferralHint('');
    setReferralValid(null);
    // Sin código: re-prefetch sesión limpia; con código esperamos al blur
    if (!next && user) prefetchProCheckout('');
  };

  const handleReferralBlur = async () => {
    if (!referralCode) {
      setReferralHint('');
      setReferralValid(null);
      if (user) prefetchProCheckout('');
      return;
    }
    try {
      const result = await validateReferralCode(referralCode);
      if (result.valid) {
        setReferralValid(true);
        setReferralHint(
          result.displayName
            ? t('premium.referralFrom', { name: result.displayName })
            : t('premium.referralValid'),
        );
        if (user) prefetchProCheckout(referralCode);
      } else {
        setReferralValid(false);
        setReferralHint(result.message || t('premium.referralInvalid'));
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
        <button type="button" className="modal-close" onClick={() => setShowPremiumModal(false)}>✕</button>
        <div className="crown">👑</div>

        {showTrial ? (
          <>
            <div className="premium-trial-hero">
              <span className="premium-trial-pill">{t('premium.trialPill')}</span>
              <h2>{t('premium.trialTitle')}</h2>
              <p className="premium-modal-lead">
                <Trans i18nKey="premium.trialLead" components={{ 1: <strong /> }} />
              </p>
            </div>

            <div className="premium-trial-card">
              <div className="premium-trial-steps">
                <div className="premium-trial-step">
                  <span className="premium-trial-step-n">1</span>
                  <div>
                    <strong>{t('premium.trialPriceBig')}</strong>
                    <span>{t('premium.trialPriceSub')}</span>
                  </div>
                </div>
                <div className="premium-trial-step-arrow" aria-hidden="true">→</div>
                <div className="premium-trial-step">
                  <span className="premium-trial-step-n">2</span>
                  <div>
                    <strong>1,99 €</strong>
                    <span>{t('premium.trialThenMonth')}</span>
                  </div>
                </div>
              </div>
              <p className="premium-trial-card-then">
                <Trans i18nKey="premium.trialThen" components={{ 1: <strong /> }} />
              </p>
            </div>
          </>
        ) : (
          <>
            <h2>{t('premium.title')}</h2>
            <p className="premium-modal-lead">
              <Trans i18nKey="premium.lead" components={{ 1: <strong /> }} />
            </p>
            <div className="price">1,99€<span>/mes</span></div>
          </>
        )}

        <ul className="premium-benefits">
          {Array.isArray(benefits) && benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <label className="referral-field">
          <span className="referral-label">{t('premium.referralLabel')}</span>
          <input
            type="text"
            className={`referral-input${referralValid === true ? ' valid' : ''}${referralValid === false ? ' invalid' : ''}`}
            placeholder={t('premium.referralPlaceholder')}
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
          {showTrial ? t('premium.trialNote') : t('premium.secureNote')}
        </p>
        {!user && (
          <p className="premium-login-hint">{t('premium.loginHint')}</p>
        )}
        <div className="modal-actions premium-modal-actions">
          <button
            type="button"
            className="modal-btn-primary"
            onClick={handleCheckout}
            disabled={proBusy || referralValid === false}
          >
            {proBusy
              ? t('premium.redirecting')
              : user
                ? (showTrial ? t('premium.checkoutTrial') : t('premium.checkout'))
                : (showTrial ? t('premium.checkoutTrialLogin') : t('premium.checkoutLogin'))}
          </button>
          <button type="button" className="modal-btn-secondary" onClick={() => setShowPremiumModal(false)}>
            {t('premium.notNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
