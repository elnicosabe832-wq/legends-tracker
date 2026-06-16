import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: '📤 Carga', end: true },
  { to: '/periodico', label: '📰 El Periódico' },
  { to: '/muro', label: '🏆 Muro de Leyendas' },
];

export default function Navigation() {
  return (
    <nav className="nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
