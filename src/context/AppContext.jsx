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

import { COMMUNITY_LIKES_EVENT } from '../lib/communityChallengeLikes';

import {

  fetchSubscriptionStatus,

  createCheckoutSession,

  createPortalSession,

} from '../lib/stripeApi';

import { buildDemoCareer, DEMO_CAREER_ID } from '../data/demoCareer';
import i18n from '../i18n';

import { buildEnshrinementSnapshot } from '../utils/hallOfFameUtils';
import { getChallengeById, FREE_ACTIVE_CHALLENGE_LIMIT } from '../data/challenges';
import { normalizePlayerProfile } from '../utils/playerProfileUtils';



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

          hallOfFame: career.hallOfFame || [],

          challenges: career.challenges || { active: [] },

          playerProfiles: career.playerProfiles || {},

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

  return Object.values(userCareers || {}).filter((c) => !c.isDemo).length;

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

  const cloudUpdatedAt = useRef(null);

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

        cloudUpdatedAt.current = row?.updated_at || null;

        if (row?.data && Object.keys(row.data.userCareers || {}).length > 0) {

          skipNextCloudSave.current = true;

          setState((current) => mergeCloudState(current, row.data));

        } else {

          const result = await uploadCloudSave(user.id, stateRef.current, cloudUpdatedAt.current);

          cloudUpdatedAt.current = result.updatedAt;

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

        const result = await uploadCloudSave(user.id, state, cloudUpdatedAt.current);

        if (result.conflict && result.data) {

          const merged = mergeCloudState(stateRef.current, result.data);

          skipNextCloudSave.current = true;

          setState(merged);

          cloudUpdatedAt.current = result.updatedAt;

          const retry = await uploadCloudSave(user.id, merged, result.updatedAt);

          if (!retry.conflict) cloudUpdatedAt.current = retry.updatedAt;

        } else {

          cloudUpdatedAt.current = result.updatedAt;

        }

        setSyncStatus('synced');

      } catch {

        setSyncStatus('error');

      }

    }, 1200);



    return () => clearTimeout(timer);

  }, [state, user]);



  // Sincroniza likes del feed de retos cuando cambian (viven fuera del state principal)

  useEffect(() => {

    if (!user || !supabase || cloudLoadedFor.current !== user.id) return undefined;



    const onLikesChange = () => {

      setSyncStatus('syncing');

      uploadCloudSave(user.id, stateRef.current, cloudUpdatedAt.current)

        .then((result) => {

          if (result.conflict && result.data) {

            const merged = mergeCloudState(stateRef.current, result.data);

            skipNextCloudSave.current = true;

            setState(merged);

            cloudUpdatedAt.current = result.updatedAt;

            return uploadCloudSave(user.id, merged, result.updatedAt);

          }

          cloudUpdatedAt.current = result.updatedAt;

          return result;

        })

        .then(() => setSyncStatus('synced'))

        .catch(() => setSyncStatus('error'));

    };



    window.addEventListener(COMMUNITY_LIKES_EVENT, onLikesChange);

    return () => window.removeEventListener(COMMUNITY_LIKES_EVENT, onLikesChange);

  }, [user?.id]);



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



  const signInWithGoogle = useCallback(async () => {

    if (!supabase) throw new Error('Supabase no configurado');

    setAuthError(null);

    const redirectTo = `${window.location.origin}${window.location.pathname}`;

    const { error } = await supabase.auth.signInWithOAuth({

      provider: 'google',

      options: { redirectTo },

    });

    if (error) {

      setAuthError(translateAuthError(error.message));

      throw error;

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

  const isDemoMode = Boolean(career?.isDemo);

  const hasCareer = careerCount > 0 || isDemoMode;



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

      hallOfFame: [],

      challenges: { active: [] },

      playerProfiles: {},

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

      const chronicle = generateChronicle(playersCopy, career.name, career.playerProfiles || {});

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



  const loadDemoCareer = useCallback(() => {

    const demo = buildDemoCareer();

    setState((s) => ({

      ...s,

      userCareers: { ...s.userCareers, [DEMO_CAREER_ID]: demo },

      activeCareer: DEMO_CAREER_ID,

      activeSeason: 'total',

      welcomeDismissed: true,

    }));

  }, []);



  const exitDemoCareer = useCallback(() => {

    setState((s) => {

      const { [DEMO_CAREER_ID]: _removed, ...rest } = s.userCareers;

      const nextId = Object.keys(rest).find((id) => !rest[id]?.isDemo) || null;

      return {

        ...s,

        userCareers: rest,

        activeCareer: nextId,

        activeSeason: 'total',

      };

    });

  }, []);



  const updatePlayerProfile = useCallback((careerId, playerName, profilePatch) => {

    setState((s) => {

      const c = s.userCareers[careerId];

      if (!c || !playerName) return s;

      const nextProfile = normalizePlayerProfile({

        ...(c.playerProfiles?.[playerName] || {}),

        ...profilePatch,

      });

      const playerProfiles = {

        ...(c.playerProfiles || {}),

        [playerName]: nextProfile,

      };

      const seasons = (c.seasons || []).map((season) => ({

        ...season,

        chronicle: generateChronicle(season.players || [], c.name, playerProfiles),

      }));

      return {

        ...s,

        userCareers: {

          ...s.userCareers,

          [careerId]: { ...c, playerProfiles, seasons },

        },

      };

    });

  }, []);



  const addPlayerToHallOfFame = useCallback((careerId, playerName, { removeFromActiveSquad }) => {

    if (!state.isPro) {

      setShowPremiumModal(true);

      return;

    }

    const data = buildEnshrinementSnapshot(state.userCareers[careerId], playerName);

    if (!data) return;

    setState((s) => {

      const c = s.userCareers[careerId];

      if (!c) return s;

      const hallOfFame = [...(c.hallOfFame || [])];

      if (hallOfFame.some((h) => h.snapshot.name === playerName)) return s;

      let seasons = c.seasons || [];

      if (removeFromActiveSquad && seasons.length) {

        const lastIdx = seasons.length - 1;

        const updated = seasons.map((season, i) =>

          (i === lastIdx

            ? {

              ...season,

              players: (season.players || []).filter((p) => p.name !== playerName),

            }

            : season),

        );

        seasons = normalizeSeasonLabels(updated);

      }

      hallOfFame.push({

        id: `hof-${Date.now()}`,

        status: 'retired',

        isLegend: true,

        enshrinedAt: new Date().toISOString(),

        reason: removeFromActiveSquad ? 'Retirado desde plantilla activa' : 'Leyenda del club',

        badges: data.badges,

        snapshot: { ...data.snapshot },

      });

      return {

        ...s,

        userCareers: {

          ...s.userCareers,

          [careerId]: { ...c, hallOfFame, seasons },

        },

      };

    });

  }, [state.isPro, state.userCareers]);



  const enshrinePlayer = useCallback((careerId, playerName) => {

    addPlayerToHallOfFame(careerId, playerName, { removeFromActiveSquad: false });

  }, [addPlayerToHallOfFame]);



  const retirePlayerToHallOfFame = useCallback((careerId, playerName, options = {}) => {

    if (options.saleFee != null && options.saleFee !== '') {

      updatePlayerProfile(careerId, playerName, { saleFee: Number(options.saleFee) });

    }

    addPlayerToHallOfFame(careerId, playerName, { removeFromActiveSquad: true });

  }, [addPlayerToHallOfFame, updatePlayerProfile]);



  const activateChallenge = useCallback((careerId, challengeId) => {

    const catalog = getChallengeById(challengeId);

    if (!catalog) return;

    if (catalog.proOnly && !state.isPro) {

      setShowPremiumModal(true);

      return;

    }

    const career = state.userCareers[careerId];

    const active = career?.challenges?.active || [];

    if (active.some((a) => a.challengeId === challengeId)) return;

    if (!state.isPro && active.length >= FREE_ACTIVE_CHALLENGE_LIMIT) {

      setShowPremiumModal(true);

      return;

    }

    setState((s) => {

      const c = s.userCareers[careerId];

      if (!c) return s;

      const list = [...(c.challenges?.active || [])];

      list.push({

        challengeId,

        progress: 0,

        status: 'active',

        activatedAt: new Date().toISOString(),

      });

      return {

        ...s,

        userCareers: {

          ...s.userCareers,

          [careerId]: { ...c, challenges: { active: list } },

        },

      };

    });

  }, [state.isPro, state.userCareers]);



  const deactivateChallenge = useCallback((careerId, challengeId) => {

    setState((s) => {

      const c = s.userCareers[careerId];

      if (!c) return s;

      const list = (c.challenges?.active || []).filter((a) => a.challengeId !== challengeId);

      return {

        ...s,

        userCareers: {

          ...s.userCareers,

          [careerId]: { ...c, challenges: { active: list } },

        },

      };

    });

  }, []);



  const updateChallengeProgress = useCallback((careerId, challengeId, nextProgress) => {

    const catalog = getChallengeById(challengeId);

    if (!catalog) return;

    const max = catalog.maxProgress;

    const progress = Math.max(0, Math.min(max, nextProgress));

    const status = progress >= max ? 'completed' : 'active';

    setState((s) => {

      const c = s.userCareers[careerId];

      if (!c) return s;

      const list = (c.challenges?.active || []).map((a) =>

        (a.challengeId === challengeId ? { ...a, progress, status } : a),

      );

      return {

        ...s,

        userCareers: {

          ...s.userCareers,

          [careerId]: { ...c, challenges: { active: list } },

        },

      };

    });

  }, []);



  const incrementChallengeProgress = useCallback((careerId, challengeId, delta = 1) => {

    const career = state.userCareers[careerId];

    const entry = career?.challenges?.active?.find((a) => a.challengeId === challengeId);

    if (!entry) return;

    updateChallengeProgress(careerId, challengeId, (entry.progress || 0) + delta);

  }, [state.userCareers, updateChallengeProgress]);



  const canActivateMoreChallenges = state.isPro

    || ((career?.challenges?.active?.length || 0) < FREE_ACTIVE_CHALLENGE_LIMIT);



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

        isDemoMode,

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

        signInWithGoogle,

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

        loadDemoCareer,

        exitDemoCareer,

        enshrinePlayer,

        retirePlayerToHallOfFame,

        updatePlayerProfile,

        activateChallenge,

        deactivateChallenge,

        incrementChallengeProgress,

        updateChallengeProgress,

        canActivateMoreChallenges,

      }}

    >

      {children}

    </AppContext.Provider>

  );

}



function translateAuthError(message) {

  if (message.includes('Invalid login credentials')) return i18n.t('auth.errors.invalidCredentials');

  if (message.includes('User already registered')) return i18n.t('auth.errors.userExists');

  if (message.includes('Password should be at least')) return i18n.t('auth.errors.weakPassword');

  if (message.includes('Email not confirmed')) return i18n.t('auth.errors.emailNotConfirmed');

  if (message.includes('Invalid API key')) {

    return 'Clave de Supabase incorrecta. Revisa .env (publishable o anon), reinicia el servidor y ejecuta npm run verify:env.';

  }

  return message || i18n.t('auth.errors.generic');

}



export function useApp() {

  const ctx = useContext(AppContext);

  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');

  return ctx;

}


