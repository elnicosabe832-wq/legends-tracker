import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function LandingHero() {
  const { t } = useTranslation();
  const { openCreateCareer, loadDemoCareer } = useApp();

  const steps = [
    { n: '1', title: t('landing.step1Title'), text: t('landing.step1Text') },
    { n: '2', title: t('landing.step2Title'), text: t('landing.step2Text') },
    { n: '3', title: t('landing.step3Title'), text: t('landing.step3Text') },
  ];

  return (
    <section className="landing-hero" aria-label="Presentation">
      <p className="landing-eyebrow">{t('landing.eyebrow')}</p>
      <h1 className="landing-title">
        <Trans i18nKey="landing.title" components={{ 1: <span className="green" /> }} />
      </h1>
      <p className="landing-lead">
        <Trans i18nKey="landing.lead" components={{ 1: <strong /> }} />
      </p>

      <div className="landing-steps">
        {steps.map((s) => (
          <div key={s.n} className="landing-step">
            <span className="landing-step-n">{s.n}</span>
            <strong>{s.title}</strong>
            <p>{s.text}</p>
          </div>
        ))}
      </div>

      <div className="landing-cta">
        <button type="button" className="create-career-btn" onClick={openCreateCareer}>
          {t('landing.startFree')}
        </button>
        <button type="button" className="landing-demo-btn" onClick={loadDemoCareer}>
          {t('landing.viewDemo')}
        </button>
        <Link to="/como-funciona" className="landing-link-btn">
          {t('landing.howItWorks')}
        </Link>
      </div>
    </section>
  );
}
