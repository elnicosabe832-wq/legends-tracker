/**
 * Equipos licenciados de EA SPORTS FC™ 25 — estructura País → Liga → Club.
 * Basado en ligas oficiales del juego (no hay API pública de EA; ampliamos manualmente).
 * Fuente de referencia: ea.com/authenticity, SoFIFA, listados de licencias FC 25.
 */

const clubs = (...names) => names.map((name) => ({
  id: name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, ''),
  name,
}));

export const EA_FC_DATABASE = [
  {
    id: 'inglaterra',
    name: 'Inglaterra',
    leagues: [
      {
        id: 'premier-league',
        name: 'Premier League',
        clubs: clubs(
          'Arsenal', 'Aston Villa', 'AFC Bournemouth', 'Brentford', 'Brighton & Hove Albion',
          'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leicester City',
          'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
          "Nott'm Forest", 'Southampton', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers',
        ),
      },
      {
        id: 'championship',
        name: 'EFL Championship',
        clubs: clubs(
          'Leeds United', 'Sheffield United', 'Burnley', 'Sunderland', 'West Bromwich Albion',
          'Middlesbrough', 'Norwich City', 'Coventry City', 'Bristol City', 'Watford',
        ),
      },
    ],
  },
  {
    id: 'espana',
    name: 'España',
    leagues: [
      {
        id: 'laliga',
        name: 'LALIGA EA SPORTS',
        clubs: clubs(
          'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Club', 'Real Sociedad',
          'Real Betis', 'Villarreal CF', 'Valencia CF', 'Sevilla FC', 'CA Osasuna',
          'RC Celta', 'Getafe CF', 'Girona FC', 'Rayo Vallecano', 'UD Las Palmas',
          'RCD Mallorca', 'Deportivo Alavés', 'CD Leganés', 'Real Valladolid', 'Espanyol',
        ),
      },
      {
        id: 'laliga-hypermotion',
        name: 'LALIGA HYPERMOTION',
        clubs: clubs(
          'Real Zaragoza', 'Sporting Gijón', 'Racing Santander', 'CD Tenerife', 'Elche CF',
          'Levante UD', 'Real Oviedo', 'Burgos CF', 'SD Eibar', 'Granada CF',
        ),
      },
    ],
  },
  {
    id: 'alemania',
    name: 'Alemania',
    leagues: [
      {
        id: 'bundesliga',
        name: 'Bundesliga',
        clubs: clubs(
          'FC Bayern München', 'Borussia Dortmund', 'RB Leipzig', 'Bayer 04 Leverkusen',
          'VfB Stuttgart', 'Eintracht Frankfurt', 'VfL Wolfsburg', 'SC Freiburg',
          '1. FC Union Berlin', 'Borussia Mönchengladbach', 'TSG Hoffenheim', 'SV Werder Bremen',
          'FC Augsburg', '1. FSV Mainz 05', 'FC St. Pauli', 'Holstein Kiel', 'VfL Bochum',
          '1. FC Heidenheim',
        ),
      },
      {
        id: '2-bundesliga',
        name: '2. Bundesliga',
        clubs: clubs(
          'Hamburger SV', '1. FC Köln', 'Hertha BSC', 'Fortuna Düsseldorf', 'Hannover 96',
          '1. FC Kaiserslautern', 'Karlsruher SC', 'SC Paderborn 07', '1. FC Nürnberg',
        ),
      },
      {
        id: '3-liga',
        name: '3. Liga',
        clubs: clubs(
          'Dynamo Dresden', 'MSV Duisburg', 'SV Waldhof Mannheim', 'FC Erzgebirge Aue',
          'SV Wehen Wiesbaden', 'SpVgg Unterhaching',
        ),
      },
    ],
  },
  {
    id: 'italia',
    name: 'Italia',
    leagues: [
      {
        id: 'serie-a',
        name: 'Serie A',
        clubs: clubs(
          'AS Roma', 'SS Lazio', 'Juventus', 'SSC Napoli', 'AC Milan', 'Inter',
          'Atalanta', 'ACF Fiorentina', 'Bologna FC', 'Torino FC', 'Udinese Calcio',
          'Genoa CFC', 'Como 1907', 'Hellas Verona', 'Cagliari Calcio', 'Empoli FC',
          'Parma Calcio', 'US Lecce', 'Monza', 'Venezia FC',
        ),
      },
      {
        id: 'serie-b',
        name: 'Serie B',
        clubs: clubs(
          'Palermo FC', 'UC Sampdoria', 'Brescia Calcio', 'SSC Bari', 'Modena FC',
          'US Cremonese', 'Pisa SC', 'Sassuolo Calcio', 'Spezia Calcio',
        ),
      },
    ],
  },
  {
    id: 'francia',
    name: 'Francia',
    leagues: [
      {
        id: 'ligue-1',
        name: 'Ligue 1',
        clubs: clubs(
          'Paris Saint-Germain', 'Olympique de Marseille', 'Olympique Lyonnais', 'AS Monaco',
          'LOSC Lille', 'OGC Nice', 'RC Lens', 'Stade Rennais', 'Stade Brestois',
          'RC Strasbourg Alsace', 'FC Nantes', 'Toulouse FC', 'Stade de Reims',
          'Le Havre AC', 'Angers SCO', 'AS Saint-Étienne', 'AJ Auxerre', 'Montpellier HSC',
        ),
      },
      {
        id: 'ligue-2',
        name: 'Ligue 2',
        clubs: clubs(
          'FC Girondins de Bordeaux', 'AS Saint-Étienne', 'SM Caen', 'FC Lorient',
          'AC Ajaccio', 'Pau FC', 'Amiens SC',
        ),
      },
    ],
  },
  {
    id: 'portugal',
    name: 'Portugal',
    leagues: [
      {
        id: 'liga-portugal',
        name: 'Liga Portugal',
        clubs: clubs(
          'FC Porto', 'SL Benfica', 'Sporting CP', 'SC Braga', 'Vitória SC',
          'Boavista FC', 'Gil Vicente FC', 'CD Santa Clara', 'FC Famalicão',
          'Casa Pia AC', 'Estoril Praia', 'Rio Ave FC', 'Moreirense FC',
          'CD Nacional', 'Farense', 'AVS', 'Arouca', 'Estrela da Amadora',
        ),
      },
    ],
  },
  {
    id: 'paises-bajos',
    name: 'Países Bajos',
    leagues: [
      {
        id: 'eredivisie',
        name: 'Eredivisie',
        clubs: clubs(
          'Ajax', 'PSV', 'Feyenoord', 'FC Utrecht', 'AZ Alkmaar', 'FC Twente',
          'SC Heerenveen', 'Sparta Rotterdam', 'Go Ahead Eagles', 'NEC Nijmegen',
          'Fortuna Sittard', 'Heracles Almelo', 'PEC Zwolle', 'FC Groningen',
          'NAC Breda', 'Willem II', 'RKC Waalwijk', 'Almere City FC',
        ),
      },
    ],
  },
  {
    id: 'belgica',
    name: 'Bélgica',
    leagues: [
      {
        id: 'jupiler-pro-league',
        name: 'Jupiler Pro League',
        clubs: clubs(
          'RSC Anderlecht', 'Club Brugge', 'KRC Genk', 'Royal Antwerp FC', 'Standard Liège',
          'KAA Gent', 'Cercle Brugge', 'Union Saint-Gilloise', 'KV Mechelen',
          'OH Leuven', 'KVC Westerlo', 'Sint-Truidense VV', 'KV Kortrijk',
          'RWD Molenbeek', 'FCV Dender EH', 'Beerschot VA',
        ),
      },
    ],
  },
  {
    id: 'escocia',
    name: 'Escocia',
    leagues: [
      {
        id: 'scottish-premiership',
        name: 'Scottish Premiership',
        clubs: clubs(
          'Celtic', 'Rangers', 'Aberdeen', 'Heart of Midlothian', 'Hibernian',
          'Dundee United', 'Motherwell', 'St. Mirren', 'Kilmarnock', 'Dundee FC',
          'Ross County', 'St. Johnstone',
        ),
      },
    ],
  },
  {
    id: 'turquia',
    name: 'Turquía',
    leagues: [
      {
        id: 'super-lig',
        name: 'Süper Lig',
        clubs: clubs(
          'Galatasaray SK', 'Fenerbahçe SK', 'Beşiktaş JK', 'Trabzonspor',
          'Başakşehir FK', 'Antalyaspor', 'Kasımpaşa SK', 'Sivasspor',
          'Konyaspor', 'Alanyaspor', 'Gaziantep FK', 'Hatayspor',
        ),
      },
    ],
  },
  {
    id: 'arabia-saudi',
    name: 'Arabia Saudita',
    leagues: [
      {
        id: 'roshn-saudi-league',
        name: 'Roshn Saudi League',
        clubs: clubs(
          'Al Hilal', 'Al Nassr', 'Al Ittihad', 'Al Ahli', 'Al Shabab',
          'Al Ettifaq', 'Al Fateh', 'Al Taawoun', 'Damac FC', 'Al Raed',
          'Al Khaleej', 'Al Riyadh', 'Al Okhdood', 'Al Wehda',
        ),
      },
    ],
  },
  {
    id: 'argentina',
    name: 'Argentina',
    leagues: [
      {
        id: 'liga-profesional',
        name: 'Liga Profesional de Fútbol',
        clubs: clubs(
          'Boca Juniors', 'River Plate', 'Racing Club', 'Independiente', 'San Lorenzo',
          'Estudiantes LP', 'Vélez Sarsfield', 'Rosario Central', 'Newell\'s Old Boys',
          'CA Talleres', 'CA Lanús', 'CA Banfield', 'Defensa y Justicia',
          'CA Huracán', 'CA Belgrano', 'Instituto ACC', 'CA Unión',
        ),
      },
    ],
  },
  {
    id: 'estados-unidos',
    name: 'Estados Unidos',
    leagues: [
      {
        id: 'mls',
        name: 'Major League Soccer',
        clubs: clubs(
          'Inter Miami CF', 'LA Galaxy', 'LAFC', 'New York City FC', 'New York Red Bulls',
          'Atlanta United', 'Seattle Sounders FC', 'Portland Timbers', 'Austin FC',
          'FC Dallas', 'Houston Dynamo FC', 'Sporting Kansas City', 'Minnesota United FC',
          'Chicago Fire FC', 'Columbus Crew', 'FC Cincinnati', 'Nashville SC',
          'Orlando City SC', 'Philadelphia Union', 'New England Revolution',
          'DC United', 'Toronto FC', 'CF Montréal', 'Vancouver Whitecaps FC',
          'San Jose Earthquakes', 'Real Salt Lake', 'Colorado Rapids', 'Charlotte FC',
          'St. Louis CITY SC',
        ),
      },
    ],
  },
  {
    id: 'mexico',
    name: 'México',
    leagues: [
      {
        id: 'liga-mx',
        name: 'LIGA MX',
        clubs: clubs(
          'Club América', 'CD Guadalajara', 'Cruz Azul', 'Club Universidad Nacional',
          'CF Monterrey', 'Tigres UANL', 'Club Tijuana', 'Atlas FC',
          'Club León', 'Deportivo Toluca FC', 'Pachuca', 'Santos Laguna',
          'Querétaro FC', 'FC Juárez', 'Mazatlán FC', 'Atlético de San Luis',
          'Puebla FC', 'Necaxa',
        ),
      },
    ],
  },
  {
    id: 'brasil',
    name: 'Brasil',
    leagues: [
      {
        id: 'brasileirao',
        name: 'Brasileirão',
        clubs: clubs(
          'Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Fluminense',
          'Atlético Mineiro', 'Grêmio', 'Internacional', 'Botafogo', 'Santos FC',
          'Athletico Paranaense', 'Fortaleza EC', 'Cruzeiro', 'Bahia', 'Vasco da Gama',
          'Red Bull Bragantino', 'Cuiabá EC', 'Goiás EC', 'Coritiba', 'América Mineiro',
        ),
      },
    ],
  },
  {
    id: 'resto-del-mundo',
    name: 'Resto del Mundo',
    leagues: [
      {
        id: 'clubes-licenciados',
        name: 'Clubes licenciados (sin liga completa)',
        clubs: clubs(
          'AEK Athens', 'Al Ain FC', 'APOEL FC', 'Atlético Nacional', 'Dynamo Kyiv',
          'Ferencvárosi TC', 'Hajduk Split', 'HJK Helsinki', 'Olympiacos FC',
          'Panathinaikos FC', 'PAOK FC', 'Qarabağ FK', 'Shakhtar Donetsk',
          'Slavia Praha', 'Sparta Praha', 'Viktoria Plzeň', 'Orlando Pirates',
        ),
      },
    ],
  },
];

export function getCountries() {
  return EA_FC_DATABASE.map(({ id, name }) => ({ id, name }));
}

export function getLeagues(countryId) {
  const country = EA_FC_DATABASE.find((c) => c.id === countryId);
  return country?.leagues.map(({ id, name }) => ({ id, name })) ?? [];
}

export function getClubs(countryId, leagueId) {
  const country = EA_FC_DATABASE.find((c) => c.id === countryId);
  const league = country?.leagues.find((l) => l.id === leagueId);
  return league?.clubs ?? [];
}

export function resolveClubSelection(countryId, leagueId, clubId) {
  const country = EA_FC_DATABASE.find((c) => c.id === countryId);
  const league = country?.leagues.find((l) => l.id === leagueId);
  const club = league?.clubs.find((c) => c.id === clubId);
  if (!country || !league || !club) return null;
  return {
    countryId: country.id,
    countryName: country.name,
    leagueId: league.id,
    leagueName: league.name,
    clubId: club.id,
    clubName: club.name,
  };
}

export function countLicensedClubs() {
  return EA_FC_DATABASE.reduce(
    (sum, c) => sum + c.leagues.reduce((s, l) => s + l.clubs.length, 0),
    0,
  );
}
