import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n, t } = useTranslation();

  return (
    <div className={`lang-switcher${className ? ` ${className}` : ''}`} role="group" aria-label={t('common.language')}>
      <span className="lang-switcher-icon" aria-hidden="true">🌐</span>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`lang-btn${i18n.language?.startsWith(code) ? ' active' : ''}`}
          onClick={() => i18n.changeLanguage(code)}
          aria-pressed={i18n.language?.startsWith(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
