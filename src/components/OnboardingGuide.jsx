const STEPS = [
  {
    n: 1,
    title: 'Crea tu carrera',
    text: 'Pulsa "+ Crear Nueva Carrera" y escribe el nombre de tu equipo en Modo Carrera.',
  },
  {
    n: 2,
    title: 'Captura las estadísticas en EA FC',
    text: 'Menú de plantilla → pestaña Estadísticas. Haz foto a cada página de la tabla (goles, asistencias, partidos…).',
  },
  {
    n: 3,
    title: 'Sube y procesa',
    text: 'Arrastra todas las capturas aquí y pulsa Procesar. Cada procesado crea una temporada nueva, o puedes reemplazar una existente si te equivocaste.',
  },
  {
    n: 4,
    title: 'Disfruta tus datos',
    text: 'El Periódico genera la crónica; el Muro muestra rankings. Con Pro puedes comparar con la historia real del club.',
  },
];

export default function OnboardingGuide() {
  return (
    <div className="onboarding-guide">
      <h3>🎮 Cómo empezar</h3>
      <ol className="onboarding-steps">
        {STEPS.map((step) => (
          <li key={step.n} className="onboarding-step">
            <span className="onboarding-num">{step.n}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="onboarding-tip">
        💡 ¿Te equivocaste? En Carga elige <strong>Reemplazar temporada</strong>, o elimínala desde el Muro / El Periódico.
      </p>
    </div>
  );
}
