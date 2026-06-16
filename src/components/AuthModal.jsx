import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const {
    showAuthModal,
    setShowAuthModal,
    signIn,
    signUp,
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
        <h2>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
        <p className="auth-modal-desc">
          Guarda tus carreras en la nube y accede desde cualquier dispositivo.
        </p>

        {!isSupabaseConfigured && (
          <div className="auth-config-warning">
            Falta configurar Supabase en el archivo <code>.env</code> del proyecto.
          </div>
        )}

        {isSupabaseConfigured && supabaseConnectionError && (
          <div className="auth-config-warning">
            {supabaseConnectionError}
          </div>
        )}

        {isSupabaseConfigured && !supabaseConnectionError && (
          <div className="auth-setup-tip">
            Tras crear cuenta verás ☁️ <strong>Guardado</strong> en el header cuando sincronice.
          </div>
        )}

        <div className="auth-mode-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => switchMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => switchMode('register')}
          >
            Registro
          </button>
        </div>

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
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
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
            {busy ? 'Conectando...' : (mode === 'login' ? 'Entrar' : 'Crear cuenta')}
          </button>
        </form>
      </div>
    </div>
  );
}
