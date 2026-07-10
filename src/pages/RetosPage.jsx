import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import CareerSelector from '../components/CareerSelector';
import EmptyCareerState from '../components/EmptyCareerState';
import ChallengeCard from '../components/ChallengeCard';
import { CHALLENGE_CATALOG, getChallengeById } from '../data/challenges';
import { usePageMeta } from '../hooks/usePageMeta';

const DIFFICULTY_KEYS = {
  Fácil: 'easy',
  Media: 'medium',
  Leyenda: 'legend',
};

export default function RetosPage() {
  const { t } = useTranslation();

  usePageMeta({
    title: t('meta.challenges'),
    description: t('meta.challengesDesc'),
    path: '/retos',
  });

  const {
    hasCareer,
    career,
    activeCareer,
    isPro,
    setShowPremiumModal,
    activateChallenge,
    deactivateChallenge,
    incrementChallengeProgress,
    updateChallengeProgress,
    canActivateMoreChallenges,
  } = useApp();

  const localizeChallenge = (ch) => ({
    ...ch,
    title: t(`retos.items.${ch.id}.title`),
    description: t(`retos.items.${ch.id}.description`),
    progressLabel: t(`retos.items.${ch.id}.progressLabel`),
    difficulty: t(`retos.difficulty.${DIFFICULTY_KEYS[ch.difficulty] || 'medium'}`),
  });

  if (!hasCareer) {
    return (
      <div className="page">
        <CareerSelector />
        <EmptyCareerState
          title={t('career.noCareerTitle')}
          description={t('career.noCareerChallenges')}
        />
      </div>
    );
  }

  const activeList = career.challenges?.active || [];
  const activeIds = new Set(activeList.map((a) => a.challengeId));
  const completedCount = activeList.filter((a) => a.status === 'completed').length;

  return (
    <div className="page">
      <CareerSelector showDelete />

      <div className="retos-header">
        <h2>
          <span className="green">{t('nav.challenges')}</span>
        </h2>
        <p>
          {t('retos.subtitle', { name: career.name })}
          {!isPro && t('retos.freeLimit')}
        </p>
      </div>

      {activeList.length > 0 && (
        <div className="retos-active-summary">
          <strong>{t('retos.activeSummary', { count: activeList.length })}</strong>
          {completedCount > 0 && (
            <span>{t('retos.completed', { count: completedCount })}</span>
          )}
        </div>
      )}

      <div className="challenges-grid">
        {CHALLENGE_CATALOG.map((ch) => {
          const entry = activeList.find((a) => a.challengeId === ch.id);
          const isActive = activeIds.has(ch.id);
          const locked = ch.proOnly && !isPro;
          const canActivate = canActivateMoreChallenges || isActive;
          const localized = localizeChallenge(ch);

          return (
            <ChallengeCard
              key={ch.id}
              challenge={localized}
              activeEntry={entry}
              isActive={isActive}
              canActivate={canActivate}
              locked={locked}
              onUnlock={() => setShowPremiumModal(true)}
              onActivate={() => activateChallenge(activeCareer, ch.id)}
              onDeactivate={() => deactivateChallenge(activeCareer, ch.id)}
              onIncrement={(delta) => incrementChallengeProgress(activeCareer, ch.id, delta)}
              onComplete={() => {
                const c = getChallengeById(ch.id);
                if (c) updateChallengeProgress(activeCareer, ch.id, c.maxProgress);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
