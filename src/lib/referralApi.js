import { apiUrl } from './apiBase';
import { normalizeReferralCode } from './referrals';

export async function validateReferralCode(raw) {
  const code = normalizeReferralCode(raw);
  if (!code) {
    return { valid: false, message: 'Introduce un código.' };
  }

  const res = await fetch(apiUrl(`/api/referrals/validate/${encodeURIComponent(code)}`));
  const data = await res.json().catch(() => ({}));
  return data;
}
