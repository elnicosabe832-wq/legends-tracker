import { Trans, useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function EmptyCareerState({ title, description }) {
  const { t } = useTranslation();
  const { openCreateCareer, isPro, careerCount } = useApp();

  return (
    <div className="empty-career">
      <div className="empty-icon">🏟️</div>
      <h3>{title || t('career.emptyTitle')}</h3>
      <p>
        {description || (
          <>
            {t('career.emptyDescription')}
            {!isPro && (
              <>
                {' '}
                <Trans
                  i18nKey="career.emptyFreePlan"
                  components={{ 1: <strong />, 2: <strong /> }}
                />
                {careerCount === 0 ? t('career.emptyFreeUsed') : ''}
              </>
            )}
          </>
        )}
      </p>
      <button className="create-career-btn" onClick={openCreateCareer}>
        {t('career.createNew')}
      </button>
    </div>
  );
}
