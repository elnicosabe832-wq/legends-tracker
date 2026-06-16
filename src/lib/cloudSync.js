import { supabase } from './supabase';
import { normalizeSeasonLabels } from '../utils/seasonUtils';

const defaultState = {
  isPro: false,
  activeCareer: null,
  activeSeason: 'total',
  welcomeDismissed: false,
  userCareers: {},
};

export function prepareStateForSave(state) {
  const userCareers = {};
  for (const [id, career] of Object.entries(state.userCareers || {})) {
    userCareers[id] = {
      ...career,
      seasons: normalizeSeasonLabels(career.seasons),
    };
  }
  return {
    activeCareer: state.activeCareer,
    activeSeason: state.activeSeason || 'total',
    welcomeDismissed: Boolean(state.welcomeDismissed),
    userCareers,
  };
}

export function mergeCloudState(localState, cloudPayload) {
  if (!cloudPayload) return prepareStateForSave(localState);

  const cloud = prepareStateForSave({ ...defaultState, ...cloudPayload });
  const mergedCareers = { ...localState.userCareers, ...cloud.userCareers };

  return prepareStateForSave({
    ...localState,
    activeCareer: cloud.activeCareer || localState.activeCareer || Object.keys(mergedCareers)[0] || null,
    activeSeason: cloud.activeSeason || localState.activeSeason || 'total',
    welcomeDismissed: localState.welcomeDismissed || cloud.welcomeDismissed,
    userCareers: mergedCareers,
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

export async function uploadCloudSave(userId, state) {
  if (!supabase) return;

  const payload = prepareStateForSave(state);
  const { error } = await supabase
    .from('user_saves')
    .upsert({
      user_id: userId,
      data: payload,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
}
