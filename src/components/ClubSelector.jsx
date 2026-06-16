import { useState } from 'react';
import { getCountries, getLeagues, getClubs } from '../data/eaFcDatabase';

export default function ClubSelector({ value, onChange, onConfirm, disabled }) {
  const [countryId, setCountryId] = useState(value?.countryId ?? '');
  const [leagueId, setLeagueId] = useState(value?.leagueId ?? '');
  const [clubId, setClubId] = useState(value?.clubId ?? '');

  const countries = getCountries();
  const leagues = countryId ? getLeagues(countryId) : [];
  const clubs = countryId && leagueId ? getClubs(countryId, leagueId) : [];

  const handleCountry = (id) => {
    setCountryId(id);
    setLeagueId('');
    setClubId('');
    onChange?.(null);
  };

  const handleLeague = (id) => {
    setLeagueId(id);
    setClubId('');
    onChange?.(null);
  };

  const handleClub = (id) => {
    setClubId(id);
    onChange?.({ countryId, leagueId, clubId: id });
  };

  const canConfirm = countryId && leagueId && clubId;

  return (
    <div className="club-selector">
      <div className="club-selector-header">
        <span className="club-selector-step">1</span>
        <div>
          <h4>País</h4>
          <p>Elige el país de la competición en EA FC</p>
        </div>
      </div>
      <select
        className="club-select"
        value={countryId}
        onChange={(e) => handleCountry(e.target.value)}
        disabled={disabled}
      >
        <option value="">— Selecciona un país —</option>
        {countries.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {countryId && (
        <>
          <div className="club-selector-divider" />
          <div className="club-selector-header">
            <span className="club-selector-step">2</span>
            <div>
              <h4>Liga</h4>
              <p>Competiciones licenciadas de EA SPORTS FC™ 25</p>
            </div>
          </div>
          <select
            className="club-select"
            value={leagueId}
            onChange={(e) => handleLeague(e.target.value)}
            disabled={disabled}
          >
            <option value="">— Selecciona una liga —</option>
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </>
      )}

      {leagueId && (
        <>
          <div className="club-selector-divider" />
          <div className="club-selector-header">
            <span className="club-selector-step">3</span>
            <div>
              <h4>Club</h4>
              <p>Equipo con el que compararás tus récords de Modo Carrera</p>
            </div>
          </div>
          <select
            className="club-select"
            value={clubId}
            onChange={(e) => handleClub(e.target.value)}
            disabled={disabled}
          >
            <option value="">— Selecciona un club —</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </>
      )}

      {canConfirm && (
        <button
          type="button"
          className="club-confirm-btn"
          onClick={() => onConfirm?.({ countryId, leagueId, clubId })}
          disabled={disabled}
        >
          Vincular club y comparar
        </button>
      )}
    </div>
  );
}
