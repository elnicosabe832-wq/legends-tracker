import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { SITE_URL } from '../lib/site.js';

const SNIPPETS = [
  {
    id: 'short',
    label: 'Mensaje corto (WhatsApp / Discord)',
    text: `Estoy usando Legends Tracker para mi Modo Carrera de EA FC — subes capturas de stats y te genera crónicas de cada temporada. Funciona en móvil y consola.\n\n${SITE_URL}`,
  },
  {
    id: 'reddit',
    label: 'Estilo Reddit (sin parecer spam)',
    text: `Console player here — I track my Career Mode seasons with a fan web app that reads screenshots of stats screens and builds chronicles (free, mobile-friendly). Not official EA.\n\n${SITE_URL}\n\nAnyone else bother tracking stats long-term?`,
  },
  {
    id: 'forum-es',
    label: 'Foro en español',
    text: `Complemento web para Modo Carrera EA FC: subes capturas de estadísticas del juego y genera crónicas de cada temporada. Gratis, funciona en consola/móvil (no hace falta PC ni subir el save). Proyecto fan, no oficial EA.\n\n${SITE_URL}`,
  },
];

function CopyBlock({ label, text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="copy-block">
      <div className="copy-block-head">
        <strong>{label}</strong>
        <button type="button" className="copy-btn" onClick={copy}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="copy-text">{text}</pre>
    </div>
  );
}

export default function CompartirPage() {
  usePageMeta({
    title: 'Compartir',
    description: 'Enlace y textos listos para compartir Legends Tracker con amigos o en foros.',
    path: '/compartir',
  });

  return (
    <div className="page legal-page">
      <h1>Compartir Legends Tracker</h1>
      <p className="legal-updated">
        Copia el enlace o un texto preparado. En Reddit conviene comentar en hilos relevantes antes de abrir post propio.
      </p>

      <CopyBlock label="Enlace directo" text={SITE_URL} />

      {SNIPPETS.map((s) => (
        <CopyBlock key={s.id} label={s.label} text={s.text} />
      ))}

      <p className="legal-back">
        <Link to="/">Volver a la app</Link>
        {' · '}
        <Link to="/como-funciona">Cómo funciona</Link>
      </p>
    </div>
  );
}
