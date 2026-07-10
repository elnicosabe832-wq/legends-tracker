import { Trans, useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function DemoBanner() {
  const { t } = useTranslation();
  const { isDemoMode, exitDemoCareer } = useApp();
  if (!isDemoMode) return null;

  return (
    <div className="demo-banner">
      <span>
        📋 <Trans i18nKey="demo.banner" components={{ 1: <strong /> }} />
      </span>
      <button type="button" className="demo-banner-exit" onClick={exitDemoCareer}>
        {t('demo.exit')}
      </button>
    </div>
  );
}
