import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function DocumentLang() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language?.startsWith('en') ? 'en' : 'es';
    document.documentElement.lang = lang;
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', lang === 'en' ? 'en_US' : 'es_ES');
  }, [i18n.language]);

  return null;
}
