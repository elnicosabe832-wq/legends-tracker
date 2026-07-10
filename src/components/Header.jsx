import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import LanguageSwitcher from './LanguageSwitcher';

function syncLabel(status, t) {
  if (status === 'syncing') return `☁️ ${t('header.syncing')}`;
  if (status === 'synced') return `☁️ ${t('header.saved')}`;
  if (status === 'error') return `☁️ ${t('header.syncError')}`;
  return '';
}

export default function Header() {
  const { t } = useTranslation();
  const {
    isPro,
    handleProClick,
    proBusy,
    user,
    authLoading,
    isSupabaseConfigured,
    setShowAuthModal,
    signOut,
    syncStatus,
    supabaseConnectionError,
  } = useApp();

  const emailShort = user?.email?.split('@')[0];

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="green">Legends</span> <span className="blue">Tracker</span>
        </div>
        <LanguageSwitcher />
        {isPro && <span className="pro-badge">★ PRO</span>}
        {user && syncStatus !== 'idle' && (
          <span className={`sync-badge sync-${syncStatus}`}>{syncLabel(syncStatus, t)}</span>
        )}
      </div>

      <div className="header-actions">

        {isSupabaseConfigured && !authLoading && !user && supabaseConnectionError && (
          <span className="sync-badge sync-error" title={supabaseConnectionError}>⚠️ Supabase</span>
        )}

        {isSupabaseConfigured && !authLoading && (
          user ? (
            <div className="auth-user">
              <span className="auth-email" title={user.email}>{emailShort}</span>
              <button type="button" className="auth-btn auth-btn-out" onClick={signOut}>
                {t('header.signOut')}
              </button>
            </div>
          ) : (
            <button type="button" className="auth-btn" onClick={() => setShowAuthModal(true)}>
              {t('header.signIn')}
            </button>
          )
        )}

        <button
          className={`pro-btn ${isPro ? 'is-pro' : ''}`}
          onClick={handleProClick}
          disabled={proBusy}
        >
          {proBusy ? (
            <span>{t('header.proBusy')}</span>
          ) : isPro ? (
            <>
              <span className="pro-btn-label-full">✓ {t('header.proActive')}</span>
              <span className="pro-btn-label-short">✓ {t('header.proActiveShort')}</span>
            </>
          ) : (
            <>
              <span className="pro-btn-label-full">{t('header.goPro')}</span>
              <span className="pro-btn-label-short">{t('header.goProShort')}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
