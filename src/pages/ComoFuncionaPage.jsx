import { usePageMeta } from '../hooks/usePageMeta';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function ComoFuncionaPage() {
  const { t } = useTranslation();

  usePageMeta({
    title: t('meta.howItWorks'),
    description: t('meta.howItWorksDesc'),
    path: '/como-funciona',
  });

  const faq = t('howItWorks.faq', { returnObjects: true });

  return (
    <div className="page legal-page">
      <h1>{t('howItWorks.title')}</h1>
      <p className="legal-updated">{t('howItWorks.subtitle')}</p>

      <section className="how-steps">
        <div className="how-step">
          <h2>{t('howItWorks.step1Title')}</h2>
          <p>{t('howItWorks.step1Text')}</p>
        </div>
        <div className="how-step">
          <h2>{t('howItWorks.step2Title')}</h2>
          <p>{t('howItWorks.step2Text')}</p>
        </div>
        <div className="how-step">
          <h2>{t('howItWorks.step3Title')}</h2>
          <p>{t('howItWorks.step3Text')}</p>
        </div>
      </section>

      <section className="faq-section">
        <h2>{t('howItWorks.faqTitle')}</h2>
        <dl className="faq-list">
          {Array.isArray(faq) && faq.map((item) => (
            <div key={item.q} className="faq-item">
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="legal-cta">
        <Link to="/" className="create-career-btn">{t('howItWorks.cta')}</Link>
      </p>
    </div>
  );
}
