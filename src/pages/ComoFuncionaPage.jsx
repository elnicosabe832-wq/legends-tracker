import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

const FAQ = [
  {
    q: '¿Necesito PC o puedo usar consola?',
    a: 'Consola y móvil valen. Solo necesitas fotos o capturas de las pantallas de estadísticas del juego. No hace falta extraer el save del juego.',
  },
  {
    q: '¿Qué capturas debo subir?',
    a: 'Pantallas donde se vean nombres de jugadores y stats: plantilla, goleadores, asistentes, porterías a cero, etc. Cuanto más legible, mejor.',
  },
  {
    q: '¿Es oficial de EA?',
    a: 'No. Legends Tracker es un proyecto fan independiente. No está afiliado a EA Sports ni a EA FC.',
  },
  {
    q: '¿Por qué tarda la primera vez?',
    a: 'El servidor gratuito puede estar “dormido”. La primera petición puede tardar hasta 1 minuto. Espera y vuelve a intentar.',
  },
  {
    q: '¿Qué incluye gratis vs Pro?',
    a: 'Gratis: carreras, crónicas, muro, sync en la nube con cuenta. Pro (1,99 €/mes): Historia Real — comparar tus jugadores con récords históricos del club.',
  },
  {
    q: '¿Guardáis mis capturas?',
    a: 'Se procesan para extraer datos. No están pensadas como galería permanente. Más detalle en la página de Privacidad.',
  },
  {
    q: '¿Funciona con EA FC 25 / 26?',
    a: 'Sí, con cualquier versión reciente de EA FC/FIFA Modo Carrera mientras las capturas muestren stats legibles en español o inglés.',
  },
];

export default function ComoFuncionaPage() {
  usePageMeta({
    title: 'Cómo funciona',
    description:
      'Guía de Legends Tracker: capturas de Modo Carrera EA FC, crónicas automáticas, temporadas, móvil y consola. Preguntas frecuentes.',
    path: '/como-funciona',
  });

  return (
    <div className="page legal-page">
      <h1>Cómo funciona</h1>
      <p className="legal-updated">Tres pasos para documentar tu Modo Carrera</p>

      <section className="how-steps">
        <div className="how-step">
          <h2>1. Crea una carrera</h2>
          <p>Elige el nombre de tu club o save de manager. Puedes tener varias carreras si eres Pro o usar la gratuita con una.</p>
        </div>
        <div className="how-step">
          <h2>2. Sube capturas</h2>
          <p>Al terminar una temporada (o cuando quieras), fotografía o exporta capturas de EA FC: estadísticas de jugadores, goleadores, etc.</p>
        </div>
        <div className="how-step">
          <h2>3. Lee tu crónica</h2>
          <p>Pulsa Procesar. Verás el periódico de la temporada, evolución en el muro y podrás acumular años de historia.</p>
        </div>
      </section>

      <section>
        <h2>Preguntas frecuentes</h2>
        <dl className="faq-list">
          {FAQ.map((item) => (
            <div key={item.q} className="faq-item">
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="legal-back">
        <Link to="/">Probar la app</Link>
        {' · '}
        <Link to="/compartir">Compartir con amigos</Link>
      </p>
    </div>
  );
}
