import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import LanguageSwitcher from './LanguageSwitcher';
import SettingsModal from './SettingsModal';

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
    isTrialing,
    trialEndsAt,
    handleProClick,
    proBusy,
    user,
    authLoading,
    isSupabaseConfigured,
    setShowAuthModal,
    syncStatus,
    supabaseConnectionError,
  } = useApp();

  const [showSettings, setShowSettings] = useState(false);

  const emailShort = user?.email?.split('@')[0];
  const trialEndsLabel = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
    : null;

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo logo-link" aria-label={t('header.home')}>
          <span className="green">Legends</span> <span className="blue">Tracker</span>
        </Link>
        <LanguageSwitcher />
        {isPro && (
          <span className={`pro-badge${isTrialing ? ' is-trial' : ''}`}>
            {isTrialing ? `★ ${t('header.trialBadge')}` : '★ PRO'}
          </span>
        )}
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
            <button
              type="button"
              className="auth-user settings-trigger"
              onClick={() => setShowSettings(true)}
              title={t('header.settings')}
              aria-label={t('header.settings')}
            >
              <span className="auth-email" title={user.email}>{emailShort}</span>
              <span className="settings-gear" aria-hidden="true">⚙</span>
            </button>
          ) : (
            <>
              <button type="button" className="auth-btn" onClick={() => setShowAuthModal(true)}>
                {t('header.signIn')}
              </button>
              <button
                type="button"
                className="settings-btn"
                onClick={() => setShowSettings(true)}
                title={t('header.settings')}
                aria-label={t('header.settings')}
              >
                ⚙
              </button>
            </>
          )
        )}

        {(!isSupabaseConfigured || authLoading) && (
          <button
            type="button"
            className="settings-btn"
            onClick={() => setShowSettings(true)}
            title={t('header.settings')}
            aria-label={t('header.settings')}
          >
            ⚙
          </button>
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
              <span className="pro-btn-label-full">
                ✓ {isTrialing
                  ? (trialEndsLabel
                    ? t('header.trialActiveUntil', { date: trialEndsLabel })
                    : t('header.trialActive'))
                  : t('header.proActive')}
              </span>
              <span className="pro-btn-label-short">
                ✓ {isTrialing ? t('header.trialBadge') : t('header.proActiveShort')}
              </span>
            </>
          ) : (
            <>
              <span className="pro-btn-label-full">{t('header.goPro')}</span>
              <span className="pro-btn-label-short">{t('header.goProShort')}</span>
            </>
          )}
        </button>
      </div>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </header>
  );
}
