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
      'El servidor devolvió una respuesta inválida. ' +
      'Asegúrate de ejecutar npm run dev (arranca web + API juntos).'
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
      'No se puede conectar al servidor de lectura.\n\n' +
      'Cierra la terminal y ejecuta:\n' +
      'npm run dev\n\n' +
      '(no uses solo "vite")'
    );
  }

  if (!health.hasApiKey) {
    throw new Error(
      'Falta configurar la clave de OpenAI.\n\n' +
      '1. Crea un archivo .env en la carpeta FL\n' +
      '2. Añade: OPENAI_API_KEY=sk-tu-clave\n' +
      '3. Reinicia con npm run dev'
    );
  }

  const res = await fetch(apiUrl('/api/process-screenshots'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images, teamName }),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    if (data.error === 'MISSING_API_KEY') {
      throw new Error(
        'Falta configurar la clave de OpenAI.\n\n' +
        '1. Crea un archivo .env en la carpeta FL\n' +
        '2. Añade: OPENAI_API_KEY=sk-tu-clave\n' +
        '3. Reinicia con npm run dev'
      );
    }
    throw new Error(data.message || data.error || `Error del servidor (${res.status})`);
  }

  return data;
}
