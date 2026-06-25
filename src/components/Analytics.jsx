import { useEffect } from 'react';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

export default function Analytics() {
  useEffect(() => {
    if (!GA_ID || window.gtag) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }, []);

  return null;
}
