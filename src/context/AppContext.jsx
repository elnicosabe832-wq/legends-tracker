import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import { generateChronicle, normalizeSeasonLabels, seasonLabel } from '../utils/seasonUtils';

import { resolveClubSelection } from '../data/eaFcDatabase';

import { getClubRecords } from '../data/clubRecords';

import { supabase, isSupabaseConfigured, verifySupabaseConnection } from '../lib/supabase';

import {

  fetchCloudSave,

  uploadCloudSave,

  mergeCloudState,

} from '../lib/cloudSync';

import {

  fetchSubscriptionStatus,

  createCheckoutSession,

  createPortalSession,

} from '../lib/stripeApi';



const STORAGE_KEY = 'legends-tracker-v2';



const defaultState = {

  isPro: false,

  activeCareer: null,

  activeSeason: 'total',

  welcomeDismissed: false,

  userCareers: {},

};



const AppContext = createContext(null);



function loadLocalState() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {

      const parsed = { ...defaultState, ...JSON.parse(saved) };

      const userCareers = {};

      for (const [id, career] of Object.entries(parsed.userCareers || {})) {

        userCareers[id] = {

          ...career,

          seasons: normalizeSeasonLabels(career.seasons),

        };

      }

      return { ...parsed, isPro: false, userCareers };

    }

  } catch {

    /* usar defaults */

  }

  return defaultState;

}



function countCareers(userCareers) {

  return Object.keys(userCareers).length;

}



export function AppProvider({ children }) {

  const [state, setState] = useState(loadLocalState);

  const [user, setUser] = useState(null);

  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authError, setAuthError] = useState(null);

  const [syncStatus, setSyncStatus] = useState('idle');

  const [supabaseConnectionError, setSupabaseConnectionError] = useState(null);

  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [loadingText, setLoadingText] = useState('');

  const [loadingSteps, setLoadingSteps] = useState('');

  const [errorMessage, setErrorMessage] = useState(null);

  const [proBusy, setProBusy] = useState(false);



  const cloudLoadedFor = useRef(null);

  const skipNextCloudSave = useRef(false);

  const stateRef = useRef(state);



  const showError = useCallback((msg) => setErrorMessage(msg), []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const clearAuthError = useCallback(() => setAuthError(null), []);



  useEffect(() => {

    stateRef.current = state;

  }, [state]);



  useEffect(() => {

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  }, [state]);



  useEffect(() => {

    if (!isSupabaseConfigured) {

      setSupabaseConnectionError(null);

      return undefined;

    }



    let cancelled = false;



    verifySupabaseConnection().then((result) => {

      if (cancelled) return;

      if (result.ok) {

        setSupabaseConnectionError(null);

        return;

      }

      if (result.reason === 'Invalid API key') {

        setSupabaseConnectionError(

          'La clave de Supabase en .env no es válida. En el dashboard usa Settings → API → Publishable key (VITE_SUPABASE_PUBLISHABLE_KEY) o Legacy → anon public (VITE_SUPABASE_ANON_KEY). Copia la clave completa, reinicia npm run dev y ejecuta npm run verify:env.',

        );

        return;

      }

      setSupabaseConnectionError(result.reason || 'No se pudo conectar con Supabase.');

    });



    return () => { cancelled = true; };

  }, []);



  useEffect(() => {

    if (!supabase) return undefined;



    supabase.auth.getSession().then(({ data: { session } }) => {

      setUser(session?.user ?? null);

      setAuthLoading(false);

    });



    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {

      setUser(session?.user ?? null);

      if (!session) {

        cloudLoadedFor.current = null;

        setSyncStatus('idle');

      }

    });



    return () => subscription.unsubscribe();

  }, []);



  useEffect(() => {

    if (!user || !supabase) return undefined;

    if (cloudLoadedFor.current === user.id) return undefined;



    let cancelled = false;



    (async () => {

      setSyncStatus('syncing');

      try {

        const row = await fetchCloudSave(user.id);

        if (cancelled) return;



        if (row?.data && Object.keys(row.data.userCareers || {}).length > 0) {

          skipNextCloudSave.current = true;

          setState((current) => mergeCloudState(current, row.data));

        } else {

          await uploadCloudSave(user.id, stateRef.current);

        }



        cloudLoadedFor.current = user.id;

        setSyncStatus('synced');

      } catch (err) {

        if (!cancelled) {

          setSyncStatus('error');

          showError(`No se pudieron sincronizar los datos: ${err.message}`);

        }

      }

    })();



    return () => { cancelled = true; };

  }, [user?.id, showError]);



  useEffect(() => {

    if (!user || !supabase || cloudLoadedFor.current !== user.id) return undefined;



    if (skipNextCloudSave.current) {

      skipNextCloudSave.current = false;

      return undefined;

    }



    const timer = setTimeout(async () => {

      setSyncStatus('syncing');

      try {

        await uploadCloudSave(user.id, state);

        setSyncStatus('synced');

      } catch {

        setSyncStatus('error');

      }

    }, 1200);



    return () => clearTimeout(timer);

  }, [state, user]);



  const signIn = useCallback(async (email, password) => {

    if (!supabase) throw new Error('Supabase no configurado');

    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {

      setAuthError(translateAuthError(error.message));

      throw error;

    }

  }, []);



  const signUp = useCallback(async (email, password) => {

    if (!supabase) throw new Error('Supabase no configurado');

    setAuthError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {

      setAuthError(translateAuthError(error.message));

      throw error;

    }

    if (!data.session) {

      setAuthError('Revisa tu email para confirmar la cuenta y luego inicia sesión.');

      throw new Error('confirmation_required');

    }

  }, []);



  const signOut = useCallback(async () => {

    if (!supabase) return;

    await supabase.auth.signOut();

    cloudLoadedFor.current = null;

    setSyncStatus('idle');

    setState((s) => ({ ...s, isPro: false }));

  }, []);



  const refreshSubscription = useCallback(async () => {

    if (!user || !supabase) return false;

    try {

      const data = await fetchSubscriptionStatus();

      setState((s) => ({ ...s, isPro: Boolean(data.isPro) }));

      return Boolean(data.isPro);

    } catch {

      setState((s) => ({ ...s, isPro: false }));

      return false;

    }

  }, [user]);



  useEffect(() => {

    if (!user) {

      setState((s) => (s.isPro ? { ...s, isPro: false } : s));

      return undefined;

    }

    refreshSubscription();

    return undefined;

  }, [user?.id, refreshSubscription]);



  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    if (params.get('pro') !== 'success' || !user) return undefined;



    let cancelled = false;



    (async () => {

      for (let attempt = 0; attempt < 6; attempt += 1) {

        if (cancelled) return;

        const isPro = await refreshSubscription();

        if (isPro) break;

        await new Promise((resolve) => { setTimeout(resolve, 1500); });

      }

      if (!cancelled) {

        window.history.replaceState({}, '', window.location.pathname);

      }

    })();



    return () => { cancelled = true; };

  }, [user, refreshSubscription]);



  const startProCheckout = useCallback(async (affiliateCode = '') => {

    if (!user) {

      setShowPremiumModal(false);

      setShowAuthModal(true);

      return;

    }

    setProBusy(true);

    try {

      const url = await createCheckoutSession(affiliateCode);

      window.location.href = url;

    } catch (err) {

      showError(err.message || 'No se pudo iniciar el pago.');

    } finally {

      setProBusy(false);

    }

  }, [user, showError]);



  const openBillingPortal = useCallback(async () => {

    if (!user) {

      setShowAuthModal(true);

      return;

    }

    setProBusy(true);

    try {

      const url = await createPortalSession();

      window.location.href = url;

    } catch (err) {

      showError(err.message || 'No se pudo abrir facturación.');

    } finally {

      setProBusy(false);

    }

  }, [user, showError]);



  const handleProClick = useCallback(() => {

    if (state.isPro) {

      openBillingPortal();

      return;

    }

    setShowPremiumModal(true);

  }, [state.isPro, openBillingPortal]);



  const careerCount = countCareers(state.userCareers);

  const career = state.activeCareer ? state.userCareers[state.activeCareer] : null;

  const hasCareer = careerCount > 0;



  const setActiveCareer = useCallback((id) => {

    setState((s) => ({ ...s, activeCareer: id, activeSeason: 'total' }));

  }, []);



  const setActiveSeason = useCallback((id) => {

    setState((s) => ({ ...s, activeSeason: id }));

  }, []);



  const openCreateCareer = useCallback(() => {

    if (!state.isPro && careerCount >= 1) {

      setShowPremiumModal(true);

    } else {

      setShowCreateModal(true);

    }

  }, [state.isPro, careerCount]);



  const createCareer = useCallback((name, subtitle) => {

    const id = `career-${Date.now()}`;

    const newCareer = {

      id,

      name: name.trim(),

      subtitle: subtitle.trim() || 'Modo Carrera',

      seasons: [],

      linkedClub: null,

      realLife: [],

    };

    setState((s) => ({

      ...s,

      userCareers: { ...s.userCareers, [id]: newCareer },

      activeCareer: id,

      activeSeason: 'total',

    }));

    setShowCreateModal(false);

  }, []);



  const applyProcessedSeason = useCallback((careerId, players, options = {}) => {

    const { replaceSeasonId } = options;



    setState((s) => {

      const career = s.userCareers[careerId];

      if (!career || !players.length) return s;



      const playersCopy = players.map((p) => ({ ...p }));

      const chronicle = generateChronicle(playersCopy, career.name);

      const replaceIdx = replaceSeasonId

        ? career.seasons.findIndex((x) => x.id === replaceSeasonId)

        : -1;



      let seasons;

      let activeSeason;



      if (replaceIdx >= 0) {

        const updated = career.seasons.map((season, i) =>

          (i === replaceIdx ? { ...season, players: playersCopy, chronicle } : season),

        );

        seasons = normalizeSeasonLabels(updated);

        activeSeason = seasons[replaceIdx]?.id || 'total';

      } else {

        const nextNum = career.seasons.length + 1;

        const newSeason = {

          id: `s${nextNum}`,

          label: seasonLabel(nextNum),

          players: playersCopy,

          chronicle,

        };

        seasons = normalizeSeasonLabels([...career.seasons, newSeason]);

        activeSeason = career.seasons.length > 0 ? 'total' : seasons[seasons.length - 1]?.id;

      }



      return {

        ...s,

        userCareers: {

          ...s.userCareers,

          [careerId]: { ...career, seasons },

        },

        activeSeason,

      };

    });

  }, []);



  const deleteSeason = useCallback((careerId, seasonId) => {

    const career = state.userCareers[careerId];

    const season = career?.seasons.find((s) => s.id === seasonId);

    if (!season) return;

    if (!window.confirm(`¿Eliminar ${season.label} y todas sus estadísticas?`)) return;



    setState((s) => {

      const c = s.userCareers[careerId];

      if (!c) return s;



      const seasons = normalizeSeasonLabels(c.seasons.filter((x) => x.id !== seasonId));

      let activeSeason = s.activeSeason;



      if (s.activeCareer === careerId) {

        activeSeason = seasons.length > 1

          ? 'total'

          : (seasons[0]?.id || 'total');

      }



      return {

        ...s,

        activeSeason,

        userCareers: {

          ...s.userCareers,

          [careerId]: { ...c, seasons },

        },

      };

    });

  }, [state.userCareers]);



  const deleteCareer = useCallback((careerId) => {

    if (!window.confirm('¿Eliminar esta carrera y todos sus datos?')) return;

    setState((s) => {

      const { [careerId]: _, ...rest } = s.userCareers;

      const ids = Object.keys(rest);

      return {

        ...s,

        userCareers: rest,

        activeCareer: ids[0] || null,

        activeSeason: 'total',

      };

    });

  }, []);



  const linkClub = useCallback((careerId, { countryId, leagueId, clubId }) => {

    if (!state.isPro) {

      setShowPremiumModal(true);

      return;

    }

    const selection = resolveClubSelection(countryId, leagueId, clubId);

    if (!selection) return;



    setState((s) => {

      const career = s.userCareers[careerId];

      if (!career) return s;

      return {

        ...s,

        userCareers: {

          ...s.userCareers,

          [careerId]: {

            ...career,

            linkedClub: selection,

            realLife: getClubRecords(selection.clubId),

          },

        },

      };

    });

  }, [state.isPro]);



  const unlinkClub = useCallback(() => {

    setState((s) => {

      const careerId = s.activeCareer;

      const career = careerId ? s.userCareers[careerId] : null;

      if (!career) return s;

      return {

        ...s,

        userCareers: {

          ...s.userCareers,

          [careerId]: {

            ...career,

            linkedClub: null,

            realLife: [],

          },

        },

      };

    });

  }, []);



  const dismissWelcome = useCallback(() => {

    setState((s) => ({ ...s, welcomeDismissed: true }));

  }, []);



  const handleCareerSelect = useCallback((value) => {

    if (value === '__create__') {

      openCreateCareer();

      return;

    }

    setActiveCareer(value);

  }, [openCreateCareer, setActiveCareer]);



  return (

    <AppContext.Provider

      value={{

        ...state,

        career,

        hasCareer,

        careerCount,

        user,

        authLoading,

        isSupabaseConfigured,

        showAuthModal,

        setShowAuthModal,

        authError,

        clearAuthError,

        signIn,

        signUp,

        signOut,

        syncStatus,

        supabaseConnectionError,

        showPremiumModal,

        setShowPremiumModal,

        showCreateModal,

        setShowCreateModal,

        loading,

        setLoading,

        loadingText,

        setLoadingText,

        loadingSteps,

        setLoadingSteps,

        errorMessage,

        showError,

        clearError,

        setActiveCareer,

        setActiveSeason,

        handleProClick,

        startProCheckout,

        openBillingPortal,

        proBusy,

        refreshSubscription,

        dismissWelcome,

        handleCareerSelect,

        openCreateCareer,

        createCareer,

        deleteCareer,

        deleteSeason,

        applyProcessedSeason,

        linkClub,

        unlinkClub,

      }}

    >

      {children}

    </AppContext.Provider>

  );

}



function translateAuthError(message) {

  if (message.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';

  if (message.includes('User already registered')) return 'Ya existe una cuenta con ese email.';

  if (message.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';

  if (message.includes('Invalid API key')) {

    return 'Clave de Supabase incorrecta. Revisa .env (publishable o anon), reinicia el servidor y ejecuta npm run verify:env.';

  }

  return message;

}



export function useApp() {

  const ctx = useContext(AppContext);

  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');

  return ctx;

}


