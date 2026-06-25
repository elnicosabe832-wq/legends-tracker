import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export default function PrivacidadPage() {
  usePageMeta({
    title: 'Privacidad',
    description: 'Política de privacidad de Legends Tracker: datos, Supabase, OpenAI, Stripe y derechos RGPD.',
    path: '/privacidad',
  });

  return (
    <div className="page legal-page">
      <h1>Política de privacidad</h1>
      <p className="legal-updated">Última actualización: junio 2026</p>

      <section>
        <h2>1. Responsable</h2>
        <p>
          Legends Tracker es un complemento no oficial para el Modo Carrera de EA FC.
          El responsable del tratamiento de los datos es el desarrollador de la aplicación.
        </p>
      </section>

      <section>
        <h2>2. Qué datos recogemos</h2>
        <ul>
          <li><strong>Cuenta:</strong> correo electrónico y contraseña (autenticación vía Supabase).</li>
          <li><strong>Partidas:</strong> nombres de carrera, estadísticas y temporadas que guardas o sincronizas en la nube.</li>
          <li><strong>Capturas:</strong> imágenes que subes para extraer estadísticas; se envían a nuestro servidor y a OpenAI solo para procesarlas.</li>
          <li><strong>Pagos Pro:</strong> Stripe gestiona el cobro; no almacenamos números de tarjeta.</li>
          <li><strong>Técnicos:</strong> datos locales en tu navegador (preferencias, sesión) y registros básicos del servidor.</li>
        </ul>
      </section>

      <section>
        <h2>3. Para qué los usamos</h2>
        <ul>
          <li>Identificarte y sincronizar tus carreras entre dispositivos.</li>
          <li>Leer capturas de EA FC y generar crónicas y estadísticas.</li>
          <li>Gestionar la suscripción Pro (1,99 €/mes).</li>
          <li>Mejorar la estabilidad y seguridad del servicio.</li>
        </ul>
      </section>

      <section>
        <h2>4. Encargados y transferencias</h2>
        <p>Usamos proveedores que pueden tratar datos fuera del EEE con garantías adecuadas:</p>
        <ul>
          <li><strong>Supabase</strong> — autenticación y base de datos.</li>
          <li><strong>OpenAI</strong> — análisis de capturas (solo el contenido que envías al procesar).</li>
          <li><strong>Stripe</strong> — pagos y facturación de Pro.</li>
          <li><strong>Vercel / Render</strong> — alojamiento de la web y la API.</li>
        </ul>
      </section>

      <section>
        <h2>5. Conservación</h2>
        <p>
          Mantenemos tu cuenta y datos de carrera mientras la uses. Las capturas se procesan
          en el momento y no se guardan como galería permanente en nuestros servidores.
          Puedes borrar carreras desde la app y eliminar tu cuenta contactando al responsable.
        </p>
      </section>

      <section>
        <h2>6. Tus derechos</h2>
        <p>
          Puedes acceder, rectificar, suprimir u oponerte al tratamiento, y presentar
          reclamación ante la AEPD (www.aepd.es). Para ejercer tus derechos, escribe desde
          el correo de tu cuenta indicando tu solicitud.
        </p>
      </section>

      <section>
        <h2>7. Menores</h2>
        <p>
          El servicio no está dirigido a menores de 14 años. Si eres padre o tutor y crees
          que un menor nos ha facilitado datos, contacta para eliminarlos.
        </p>
      </section>

      <section>
        <h2>8. Cambios</h2>
        <p>
          Podemos actualizar esta política. La fecha de revisión aparecerá arriba.
          El uso continuado de la app implica la aceptación de la versión vigente.
        </p>
      </section>

      <p className="legal-back">
        <Link to="/">← Volver a la app</Link>
      </p>
    </div>
  );
}
