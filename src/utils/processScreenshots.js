import { apiUrl } from '../lib/apiBase';

export function compressImage(dataUrl, maxWidth = 1400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => reject(new Error('No se pudo leer una imagen'));
    img.src = dataUrl;
  });
}

export async function prepareImagesForUpload(dataUrls) {
  const compressed = await Promise.all(dataUrls.map((url) => compressImage(url)));
  return compressed;
}

async function safeJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      'El servidor tardó demasiado en responder.\n\n' +
      'Vuelve a pulsar Procesar en 1 minuto (Render puede estar despertando).'
    );
  }
}

export async function processScreenshots(images, teamName) {
  let health;
  try {
    const healthRes = await fetch(apiUrl('/api/health'));
    health = await safeJson(healthRes);
  } catch {
    throw new Error(
      'No se puede conectar al servidor.\n\n' +
      'Espera 30–60 s y vuelve a intentarlo (el servidor puede estar despertando).\n' +
      'Comprueba tu conexión a internet.'
    );
  }

  if (!health.hasApiKey) {
    throw new Error('El servidor no tiene configurada la lectura IA. Inténtalo más tarde.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  let res;
  try {
    res = await fetch(apiUrl('/api/process-screenshots'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images, teamName }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(
        'El procesado tardó más de 2 minutos.\n\n' +
        'Prueba con menos capturas o espera 1 min y vuelve a intentar.',
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const data = await safeJson(res);

  if (!res.ok) {
    if (data.error === 'MISSING_API_KEY') {
      throw new Error('El servidor no tiene configurada la lectura IA. Inténtalo más tarde.');
    }
    throw new Error(data.message || data.error || `Error del servidor (${res.status})`);
  }

  return data;
}
