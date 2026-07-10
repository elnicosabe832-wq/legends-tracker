import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SITE_NAME, SITE_URL } from '../lib/site.js';

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageMeta({ title, description, path = '' }) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const pageTitle = title
      ? `${title} — ${SITE_NAME}`
      : `${SITE_NAME} — ${t('meta.defaultTitle')}`;
    const desc = description || t('meta.defaultDescription');
    const url = `${SITE_URL}${path}`;

    document.title = pageTitle;
    setMeta('description', desc);
    setMeta('og:title', pageTitle, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    setMeta('og:image', `${SITE_URL}/og-image.svg`, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', `${SITE_URL}/og-image.svg`);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, path, t, i18n.language]);
}
