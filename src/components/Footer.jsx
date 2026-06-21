import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Legends Tracker — complemento no oficial para Modo Carrera EA FC
      </p>
      <p className="site-footer-links">
        <Link to="/privacidad">Privacidad</Link>
        <span aria-hidden="true"> · </span>
        <a href="https://legends-tracker-five.vercel.app" rel="noopener noreferrer">
          legends-tracker-five.vercel.app
        </a>
      </p>
    </footer>
  );
}
