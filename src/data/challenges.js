export const CHALLENGE_CATALOG = [
  {
    id: 'cantera-titulo',
    title: 'Reto de Cantera',
    description:
      'Gana un título alineando al menos a 3 jugadores de las categorías inferiores en el XI inicial.',
    difficulty: 'Media',
    maxProgress: 1,
    progressLabel: 'Títulos con cantera',
    proOnly: false,
  },
  {
    id: 'fichajes-nacionalidad',
    title: 'Política de Fichajes Estricta',
    description:
      'Solo puedes fichar jugadores de la misma nacionalidad que el club durante 3 temporadas consecutivas.',
    difficulty: 'Leyenda',
    maxProgress: 3,
    progressLabel: 'Temporadas cumplidas',
    proOnly: true,
  },
  {
    id: 'salvador-ascenso',
    title: 'El Salvador',
    description:
      'Toma un club de la división más baja y consigue el ascenso en la primera temporada sin gastar más de 5M en fichajes.',
    difficulty: 'Leyenda',
    maxProgress: 1,
    progressLabel: 'Ascenso logrado',
    proOnly: true,
  },
  {
    id: 'porteria-cero',
    title: 'Muro Infranqueable',
    description: 'Mantén 15 porterías a cero en una sola temporada de liga.',
    difficulty: 'Media',
    maxProgress: 15,
    progressLabel: 'Porterías a cero',
    proOnly: false,
  },
  {
    id: 'goleador-30',
    title: 'Romper el Récord',
    description: 'Un jugador de tu plantilla debe marcar 30 o más goles en una temporada.',
    difficulty: 'Fácil',
    maxProgress: 30,
    progressLabel: 'Goles del máximo goleador',
    proOnly: false,
  },
  {
    id: 'leyenda-local',
    title: 'Un Club, Una Ciudad',
    description: 'Completa 5 temporadas con el mismo club sin cambiar de equipo.',
    difficulty: 'Fácil',
    maxProgress: 5,
    progressLabel: 'Temporadas en el club',
    proOnly: false,
  },
];

export function getChallengeById(id) {
  return CHALLENGE_CATALOG.find((c) => c.id === id);
}

export const FREE_ACTIVE_CHALLENGE_LIMIT = 1;
