import { useApp } from '../context/AppContext';



function syncLabel(status) {

  if (status === 'syncing') return '☁️ Sincronizando...';

  if (status === 'synced') return '☁️ Guardado';

  if (status === 'error') return '☁️ Error sync';

  return '';

}



export default function Header() {

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

        {isPro && <span className="pro-badge">★ PRO</span>}

        {user && syncStatus !== 'idle' && (

          <span className={`sync-badge sync-${syncStatus}`}>{syncLabel(syncStatus)}</span>

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

                Salir

              </button>

            </div>

          ) : (

            <button type="button" className="auth-btn" onClick={() => setShowAuthModal(true)}>

              Entrar

            </button>

          )

        )}



        <button
          className={`pro-btn ${isPro ? 'is-pro' : ''}`}
          onClick={handleProClick}
          disabled={proBusy}
        >

          {proBusy ? (
            <span>Pro...</span>
          ) : isPro ? (

            <>

              <span className="pro-btn-label-full">✓ Modo Pro Activo</span>

              <span className="pro-btn-label-short">✓ PRO</span>

            </>

          ) : (

            <>

              <span className="pro-btn-label-full">Hacerse Pro · 1,99€/mes</span>

              <span className="pro-btn-label-short">Pro 1,99€</span>

            </>

          )}

        </button>

      </div>

    </header>

  );

}

