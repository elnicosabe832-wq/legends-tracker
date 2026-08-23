/** Perfiles enriquecidos por jugador (edad, origen, fichajes). */

export const PLAYER_ORIGIN = {
  academy: 'academy',
  signing: 'signing',
};

export function emptyPlayerProfile() {
  return {
    age: null,
    origin: null,
    transferFee: null,
    saleFee: null,
  };
}

export function normalizePlayerProfile(raw = {}) {
  const age = raw.age != null && raw.age !== '' ? Number(raw.age) : null;
  const transferFee = raw.transferFee != null && raw.transferFee !== ''
    ? Number(raw.transferFee)
    : null;
  const saleFee = raw.saleFee != null && raw.saleFee !== ''
    ? Number(raw.saleFee)
    : null;
  const origin = raw.origin === PLAYER_ORIGIN.academy || raw.origin === PLAYER_ORIGIN.signing
    ? raw.origin
    : null;

  return {
    age: Number.isFinite(age) && age > 0 ? Math.round(age) : null,
    origin,
    transferFee: Number.isFinite(transferFee) && transferFee >= 0 ? transferFee : null,
    saleFee: Number.isFinite(saleFee) && saleFee >= 0 ? saleFee : null,
  };
}

/** Formatea euros: 5M €, 750K €, 500 € */
export function formatTransferFee(n) {
  if (n == null || n === '' || Number.isNaN(Number(n))) return null;
  const v = Number(n);
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}M €`;
  }
  if (v >= 1_000) return `${Math.round(v / 1_000)}K €`;
  return `${Math.round(v)} €`;
}

/** % ganancia/pérdida: venta vs fichaje. null si no aplica. */
export function transferProfitPct(transferFee, saleFee) {
  const buy = Number(transferFee);
  const sell = Number(saleFee);
  if (!Number.isFinite(buy) || buy <= 0 || !Number.isFinite(sell) || sell < 0) return null;
  return Math.round(((sell - buy) / buy) * 100);
}

export function getPlayerProfile(career, playerName) {
  if (!career?.playerProfiles || !playerName) return emptyPlayerProfile();
  return normalizePlayerProfile(career.playerProfiles[playerName] || {});
}

export function profileHasData(profile) {
  if (!profile) return false;
  return Boolean(
    profile.age
    || profile.origin
    || (profile.transferFee != null && profile.transferFee >= 0)
    || (profile.saleFee != null && profile.saleFee >= 0),
  );
}

/** Texto corto para UI (badges). */
export function profileBadgeParts(profile, t) {
  const parts = [];
  if (profile?.age) parts.push(`${profile.age} ${t ? t('playerProfile.years') : 'años'}`);
  if (profile?.origin === PLAYER_ORIGIN.academy) {
    parts.push(t ? t('playerProfile.originAcademy') : 'Cantera');
  } else if (profile?.origin === PLAYER_ORIGIN.signing) {
    parts.push(t ? t('playerProfile.originSigning') : 'Fichaje');
  }
  const fee = formatTransferFee(profile?.transferFee);
  if (fee && profile?.origin === PLAYER_ORIGIN.signing) parts.push(fee);
  const pct = transferProfitPct(profile?.transferFee, profile?.saleFee);
  if (pct != null) {
    const sign = pct > 0 ? '+' : '';
    parts.push(`${sign}${pct}%`);
  }
  return parts;
}
