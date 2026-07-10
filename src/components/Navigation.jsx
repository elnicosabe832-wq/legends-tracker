import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navigation() {
  const { t } = useTranslation();

  const tabs = [
    { to: '/', label: `📤 ${t('nav.upload')}`, end: true },
    { to: '/periodico', label: `📰 ${t('nav.newspaper')}` },
    { to: '/muro', label: `🏆 ${t('nav.wall')}` },
    { to: '/retos', label: `🎯 ${t('nav.challenges')}` },
  ];

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
