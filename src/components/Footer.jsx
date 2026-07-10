import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SITE_URL } from '../lib/site.js';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <LanguageSwitcher className="lang-switcher-footer" />
      <p>{t('footer.tagline')}</p>
      <p className="site-footer-links">
        <Link to="/como-funciona">{t('footer.howItWorks')}</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/retos">{t('footer.challenges')}</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/compartir">{t('footer.share')}</Link>
        <span aria-hidden="true"> · </span>
        <Link to="/privacidad">{t('footer.privacy')}</Link>
        <span aria-hidden="true"> · </span>
        <a href={SITE_URL} rel="noopener noreferrer">
          {SITE_URL.replace(/^https:\/\//, '')}
        </a>
      </p>
    </footer>
  );
}
