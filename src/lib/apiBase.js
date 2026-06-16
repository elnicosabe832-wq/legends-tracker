/** URL base del API en producción (Render/Railway). Vacío en local → usa proxy /api de Vite. */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL?.trim();
  return raw ? raw.replace(/\/$/, '') : '';
}

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBase();
  return base ? `${base}${normalized}` : normalized;
}
