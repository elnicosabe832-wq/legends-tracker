import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const { t } = useTranslation();
  const {
    showAuthModal,
    setShowAuthModal,
    signIn,
    signUp,
    signInWithGoogle,
    authError,
    clearAuthError,
    isSupabaseConfigured,
    supabaseConnectionError,
  } = useApp();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (!showAuthModal) return null;

  const close = () => {
    setShowAuthModal(false);
    clearAuthError();
    setBusy(false);
  };

  const switchMode = (next) => {
    setMode(next);
    clearAuthError();
  };

  const handleGoogle = async () => {
    setBusy(true);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch {
      setBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    clearAuthError();
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
      close();
    } catch {
      /* authError en contexto */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay visible" onClick={close}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={close}>✕</button>

        <div className="auth-modal-icon">☁️</div>
        <h2>{mode === 'login' ? t('auth.login') : t('auth.register')}</h2>
        <p className="auth-modal-desc">{t('auth.desc')}</p>

        {!isSupabaseConfigured && (
          <div className="auth-config-warning">
            <Trans i18nKey="auth.noSupabase" components={{ 1: <code /> }} />
          </div>
        )}

        {isSupabaseConfigured && supabaseConnectionError && (
          <div className="auth-config-warning">
            {supabaseConnectionError}
          </div>
        )}

        {isSupabaseConfigured && !supabaseConnectionError && (
          <div className="auth-setup-tip">
            <Trans i18nKey="auth.syncTip" components={{ 1: <strong /> }} />
          </div>
        )}

        <div className="auth-mode-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => switchMode('login')}
          >
            {t('auth.loginTab')}
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => switchMode('register')}
          >
            {t('auth.registerTab')}
          </button>
        </div>

        {isSupabaseConfigured && !supabaseConnectionError && (
          <>
            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogle}
              disabled={busy}
            >
              <span className="auth-google-icon" aria-hidden="true">G</span>
              {t('auth.google')}
            </button>
            <p className="auth-divider"><span>{t('auth.orEmail')}</span></p>
          </>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            {t('auth.password')}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </label>

          {authError && <p className="auth-error">{authError}</p>}

          <button
            type="submit"
            className="modal-btn-primary"
            disabled={busy || !isSupabaseConfigured || Boolean(supabaseConnectionError)}
          >
            {busy ? t('auth.connecting') : (mode === 'login' ? t('auth.loginTab') : t('auth.register'))}
          </button>
        </form>
      </div>
    </div>
  );
}
