import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STEPS = [
  { n: '1', title: 'Captura', text: 'Haz fotos de tus pantallas de stats en EA FC (plantilla, goleadores…).' },
  { n: '2', title: 'Procesa', text: 'Sube las imágenes. La app lee los datos y crea la temporada.' },
  { n: '3', title: 'Crónica', text: 'Lee el periódico, el muro de leyendas y evolución de jugadores.' },
];

export default function LandingHero() {
  const { openCreateCareer } = useApp();

  return (
    <section className="landing-hero" aria-label="Presentación">
      <p className="landing-eyebrow">Complemento no oficial · EA Sports FC Modo Carrera</p>
      <h1 className="landing-title">
        Tu carrera merece <span className="green">crónica</span>
      </h1>
      <p className="landing-lead">
        Sube capturas de estadísticas — funciona en <strong>móvil y consola</strong>, sin subir saves de PC.
        Genera crónicas, lleva temporadas y revive tus leyendas.
      </p>

      <div className="landing-steps">
        {STEPS.map((s) => (
          <div key={s.n} className="landing-step">
            <span className="landing-step-n">{s.n}</span>
            <strong>{s.title}</strong>
            <p>{s.text}</p>
          </div>
        ))}
      </div>

      <div className="landing-cta">
        <button type="button" className="create-career-btn" onClick={openCreateCareer}>
          Empezar gratis
        </button>
        <Link to="/como-funciona" className="landing-link-btn">
          Cómo funciona
        </Link>
      </div>
    </section>
  );
}
