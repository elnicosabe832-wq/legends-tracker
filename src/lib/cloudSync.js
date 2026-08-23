import { supabase } from './supabase';
import { normalizeSeasonLabels } from '../utils/seasonUtils';
import {
  getUserLikedChallengeIds,
  setUserLikedChallengeIds,
} from './communityChallengeLikes';

const defaultState = {
  isPro: false,
  activeCareer: null,
  activeSeason: 'total',
  welcomeDismissed: false,
  userCareers: {},
};

const MAX_SAVE_CHARS = 1_800_000; // margen bajo el límite RPC de 2 MiB

export function prepareStateForSave(state) {
  const userCareers = {};
  for (const [id, career] of Object.entries(state.userCareers || {})) {
    if (career.isDemo) continue;
    userCareers[id] = {
      ...career,
      seasons: normalizeSeasonLabels(career.seasons),
      hallOfFame: career.hallOfFame || [],
      challenges: career.challenges || { active: [] },
      playerProfiles: career.playerProfiles || {},
    };
  }

  const likedFromState = Array.isArray(state.communityLikedIds)
    ? state.communityLikedIds
    : [...getUserLikedChallengeIds()];

  return {
    activeCareer: state.activeCareer,
    activeSeason: state.activeSeason || 'total',
    welcomeDismissed: Boolean(state.welcomeDismissed),
    userCareers,
    communityLikedIds: likedFromState,
  };
}

function mergeLikedIds(localIds = [], cloudIds = []) {
  return [...new Set([...(localIds || []), ...(cloudIds || [])].filter(Boolean))];
}

export function mergeCloudState(localState, cloudPayload) {
  if (!cloudPayload) return prepareStateForSave(localState);

  const cloud = prepareStateForSave({ ...defaultState, ...cloudPayload });
  const localPrepared = prepareStateForSave(localState);
  const mergedCareers = { ...localState.userCareers, ...cloud.userCareers };
  const communityLikedIds = mergeLikedIds(
    localPrepared.communityLikedIds,
    cloud.communityLikedIds,
  );

  setUserLikedChallengeIds(communityLikedIds);

  return prepareStateForSave({
    ...localState,
    activeCareer: cloud.activeCareer || localState.activeCareer || Object.keys(mergedCareers)[0] || null,
    activeSeason: cloud.activeSeason || localState.activeSeason || 'total',
    welcomeDismissed: localState.welcomeDismissed || cloud.welcomeDismissed,
    userCareers: mergedCareers,
    communityLikedIds,
  });
}

export async function fetchCloudSave(userId) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_saves')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Sube el save con control de conflictos vía RPC (si está desplegada).
 * @returns {{ updatedAt: string, conflict: boolean, data?: object }}
 */
export async function uploadCloudSave(userId, state, expectedUpdatedAt = null) {
  if (!supabase) return { updatedAt: null, conflict: false };

  const payload = prepareStateForSave(state);
  const serialized = JSON.stringify(payload);
  if (serialized.length > MAX_SAVE_CHARS) {
    throw new Error('Tu save es demasiado grande para sincronizar. Borra una carrera antigua o contacta soporte.');
  }

  // Preferir RPC endurecida (schema-sync-hardening.sql)
  const { data: rpcRows, error: rpcError } = await supabase.rpc('upsert_user_save', {
    p_data: payload,
    p_expected_updated_at: expectedUpdatedAt || null,
  });

  if (!rpcError) {
    const row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
    return {
      updatedAt: row?.out_updated_at || null,
      conflict: Boolean(row?.out_conflict),
      data: row?.out_data || null,
    };
  }

  // Fallback si aún no ejecutaron el SQL de hardening
  const missingFn = /function|does not exist|PGRST202/i.test(rpcError.message || '');
  if (!missingFn) {
    throw new Error(rpcError.message);
  }

  const { error } = await supabase
    .from('user_saves')
    .upsert({
      user_id: userId,
      data: payload,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);

  const refreshed = await fetchCloudSave(userId);
  return {
    updatedAt: refreshed?.updated_at || new Date().toISOString(),
    conflict: false,
    data: refreshed?.data || payload,
  };
}
