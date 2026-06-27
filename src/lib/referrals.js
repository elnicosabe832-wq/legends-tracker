const STORAGE_KEY = 'lt_referral_code';

export function normalizeReferralCode(raw) {
  return String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function getStoredReferralCode() {
  try {
    return normalizeReferralCode(localStorage.getItem(STORAGE_KEY));
  } catch {
    return '';
  }
}

export function setStoredReferralCode(code) {
  const normalized = normalizeReferralCode(code);
  try {
    if (normalized) localStorage.setItem(STORAGE_KEY, normalized);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return normalized;
}

/** Lee ?ref=CODIGO de la URL y lo guarda en localStorage. */
export function captureReferralFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (!ref) return '';

  const code = setStoredReferralCode(ref);

  params.delete('ref');
  const rest = params.toString();
  const next = `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', next);

  return code;
}
