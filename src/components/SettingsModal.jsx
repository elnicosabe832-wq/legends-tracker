import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function SettingsModal({ open, onClose }) {
  const { t } = useTranslation();
  const {
    user,
    isPro,
    isTrialing,
    trialEndsAt,
    proBusy,
    openBillingPortal,
    setShowPremiumModal,
    setShowAuthModal,
    signOut,
    isSupabaseConfigured,
  } = useApp();

  if (!open) return null;

  const trialEndsLabel = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : null;

  const planLabel = (() => {
    if (!user) return t('settings.planGuest');
    if (isTrialing) {
      return trialEndsLabel
        ? t('settings.planTrialUntil', { date: trialEndsLabel })
        : t('settings.planTrial');
    }
    if (isPro) return t('settings.planPro');
    return t('settings.planFree');
  })();

  const close = () => onClose();

  const handleManageSubscription = async () => {
    if (!user) {
      close();
      setShowAuthModal(true);
      return;
    }
    if (isPro) {
      await openBillingPortal();
      return;
    }
    close();
    setShowPremiumModal(true);
  };

  const handleSignIn = () => {
    close();
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    close();
    await signOut();
  };

  const handleGoPro = () => {
    close();
    setShowPremiumModal(true);
  };

  return (
    <div className="modal-overlay visible" onClick={close}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={close}>✕</button>
        <h2>{t('settings.title')}</h2>
        <p className="settings-lead">{t('settings.lead')}</p>

        <section className="settings-section">
          <h3>{t('settings.account')}</h3>
          {user ? (
            <div className="settings-row">
              <div className="settings-row-text">
                <strong>{t('settings.signedInAs')}</strong>
                <span className="settings-muted" title={user.email}>{user.email}</span>
              </div>
            </div>
          ) : (
            <div className="settings-row">
              <div className="settings-row-text">
                <strong>{t('settings.notSignedIn')}</strong>
                <span className="settings-muted">{t('settings.signInHint')}</span>
              </div>
              {isSupabaseConfigured && (
                <button type="button" className="settings-action-btn" onClick={handleSignIn}>
                  {t('header.signIn')}
                </button>
              )}
            </div>
          )}
        </section>

        <section className="settings-section">
          <h3>{t('settings.subscription')}</h3>
          <div className="settings-row">
            <div className="settings-row-text">
              <strong>{t('settings.currentPlan')}</strong>
              <span className={`settings-plan-badge${isPro ? ' is-pro' : ''}${isTrialing ? ' is-trial' : ''}`}>
                {planLabel}
              </span>
            </div>
          </div>
          <div className="settings-actions">
            {isPro ? (
              <button
                type="button"
                className="modal-btn-primary"
                onClick={handleManageSubscription}
                disabled={proBusy}
              >
                {proBusy ? t('header.proBusy') : t('settings.manageBilling')}
              </button>
            ) : (
              <button
                type="button"
                className="modal-btn-primary"
                onClick={handleGoPro}
                disabled={proBusy}
              >
                {t('settings.upgradePro')}
              </button>
            )}
            {isPro && (
              <p className="settings-hint">{t('settings.billingHint')}</p>
            )}
          </div>
        </section>

        <section className="settings-section">
          <h3>{t('settings.language')}</h3>
          <LanguageSwitcher className="settings-lang" />
        </section>

        <section className="settings-section settings-links">
          <h3>{t('settings.more')}</h3>
          <Link to="/como-funciona" className="settings-link" onClick={close}>
            {t('footer.howItWorks')}
          </Link>
          <Link to="/privacidad" className="settings-link" onClick={close}>
            {t('footer.privacy')}
          </Link>
        </section>

        {user && (
          <div className="settings-footer">
            <button type="button" className="settings-signout" onClick={handleSignOut}>
              {t('header.signOut')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
