import { useState } from 'react';
import { getClubCrestMeta, clubInitials } from '../data/clubCrests';

export default function ClubCrest({ clubId, clubName, size = 64, className = '' }) {
  const meta = getClubCrestMeta(clubId);
  const [failed, setFailed] = useState(false);
  const initials = clubInitials(clubName || clubId || '?');
  const colors = meta?.colors || ['#00ff88', '#0a0e17'];

  if (meta?.file && !failed) {
    return (
      <img
        className={`club-crest ${className}`.trim()}
        src={meta.file}
        alt={clubName || clubId}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`club-crest club-crest-fallback ${className}`.trim()}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1] || colors[0]})`,
        fontSize: Math.max(12, size * 0.28),
      }}
      aria-label={clubName || clubId}
    >
      {initials}
    </span>
  );
}
