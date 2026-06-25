import { Link } from 'react-router-dom';
import { SITE_URL } from '../lib/site.js';

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Legends Tracker — complemento no oficial para Modo Carrera EA FC
      </p>
      <p className="site-footer-links">
        <Link to="/como-funciona">Cómo funciona</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/compartir">Compartir</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/privacidad">Privacidad</Link>
        <span aria-hidden="true"> · </span>
        <a href={SITE_URL} rel="noopener noreferrer">
          {SITE_URL.replace(/^https:\/\//, '')}
        </a>
      </p>
    </footer>
  );
}
