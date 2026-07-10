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
    proBusy,
    user,
    setShowAuthModal,
  } = useApp();

  const [referralCode, setReferralCode] = useState('');
  const [referralHint, setReferralHint] = useState('');
  const [referralValid, setReferralValid] = useState(null);

  const benefits = t('premium.benefits', { returnObjects: true });

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
        setReferralHint(
          result.displayName
            ? t('premium.referralFrom', { name: result.displayName })
            : t('premium.referralValid'),
        );
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
        <button className="modal-close" onClick={() => setShowPremiumModal(false)}>✕</button>
        <div className="crown">👑</div>
        <h2>{t('premium.title')}</h2>
        <p className="premium-modal-lead">
          <Trans i18nKey="premium.lead" components={{ 1: <strong /> }} />
        </p>

        <ul className="premium-benefits">
          {Array.isArray(benefits) && benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <div className="price">1,99€<span>/mes</span></div>

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

        <p className="premium-note">{t('premium.secureNote')}</p>
        {!user && (
          <p className="premium-login-hint">{t('premium.loginHint')}</p>
        )}
        <div className="modal-actions premium-modal-actions">
          <button
            className="modal-btn-primary"
            onClick={handleCheckout}
            disabled={proBusy || referralValid === false}
          >
            {proBusy ? t('premium.redirecting') : (user ? t('premium.checkout') : t('premium.checkoutLogin'))}
          </button>
          <button className="modal-btn-secondary" onClick={() => setShowPremiumModal(false)}>
            {t('premium.notNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
