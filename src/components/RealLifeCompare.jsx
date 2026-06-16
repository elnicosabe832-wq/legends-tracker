import { getTopPlayer } from '../utils/seasonUtils';
import { getClubRecords, hasClubRecords } from '../data/clubRecords';

export default function RealLifeCompare({ career, seasonData }) {
  const linked = career?.linkedClub;
  const records = linked ? getClubRecords(linked.clubId) : (career?.realLife ?? []);

  if (!linked && !records.length) return null;

  const clubLabel = linked
    ? `${linked.clubName} (${linked.leagueName})`
    : career.name;

  if (linked && !hasClubRecords(linked.clubId)) {
    return (
      <div className="real-compare real-compare-pending">
        <h3>⚖️ Tu Carrera vs. Historia Real</h3>
        <p>
          Has vinculado <strong>{clubLabel}</strong>, pero aún no tenemos récords históricos
          cargados para este equipo. Estamos ampliando la base de datos.
        </p>
      </div>
    );
  }

  if (!records.length) return null;

  return (
    <div className="real-compare" id="realCompare">
      <h3>⚖️ Tu Carrera vs. Historia Real del Club</h3>
      <p>
        <strong>{clubLabel}</strong> — {seasonData.label} (todas las competiciones)
        comparado con los <strong>récords históricos del club</strong>.
      </p>
      <table className="compare-table">
        <thead>
          <tr>
            <th>Récord del club</th>
            <th>Tu Modo Carrera</th>
            <th>Récord histórico real</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {records.map((item) => {
            const top = getTopPlayer(seasonData.players, item.stat, item.gkOnly);
            const yourVal = top[item.stat] || 0;
            const pct = Math.min(100, Math.round((yourVal / item.record) * 100));
            const pctClass = pct >= 50 ? 'high' : pct >= 20 ? 'mid' : 'low';
            return (
              <tr key={item.category}>
                <td>{item.category}</td>
                <td className="you">{top.name}: {yourVal} {item.unit}</td>
                <td className="real">{item.recordHolder}: {item.record} {item.unit}</td>
                <td className={`pct ${pctClass}`}>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
