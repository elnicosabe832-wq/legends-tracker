import { useTranslation } from 'react-i18next';

const DIFFICULTY_CLASS = {
  Fácil: 'easy',
  Media: 'medium',
  Leyenda: 'legend',
  Easy: 'easy',
  Medium: 'medium',
  Legend: 'legend',
};

export default function ChallengeCard({
  challenge,
  activeEntry,
  isActive,
  canActivate,
  onActivate,
  onDeactivate,
  onIncrement,
  onComplete,
  locked,
  onUnlock,
}) {
  const { t } = useTranslation();
  const progress = activeEntry?.progress ?? 0;
  const max = challenge.maxProgress;
  const pct = max > 0 ? Math.min(100, Math.round((progress / max) * 100)) : 0;
  const completed = activeEntry?.status === 'completed' || progress >= max;
  const diffClass = DIFFICULTY_CLASS[challenge.difficulty] || 'medium';

  const handleActivate = () => {
    if (locked) {
      onUnlock?.();
      return;
    }
    if (isActive) {
      onDeactivate?.();
    } else {
      onActivate?.();
    }
  };

  return (
    <article className={`challenge-card challenge-${diffClass}${completed ? ' completed' : ''}${isActive ? ' active' : ''}`}>
      <div className="challenge-card-top">
        <span className={`challenge-difficulty challenge-diff-${diffClass}`}>
          {challenge.difficulty}
        </span>
        {challenge.proOnly && <span className="challenge-pro-badge">PRO</span>}
        {completed && <span className="challenge-done-badge">✓ {t('retos.completedLabel')}</span>}
      </div>
      <h3>{challenge.title}</h3>
      <p className="challenge-desc">{challenge.description}</p>

      <div className="challenge-progress-wrap">
        <div className="challenge-progress-label">
          <span>{challenge.progressLabel}</span>
          <span>{completed ? t('retos.completedLabel') : `${progress}/${max}`}</span>
        </div>
        <div className="challenge-progress-bar">
          <div className="challenge-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {isActive && !completed && (
        <div className="challenge-progress-actions">
          <button type="button" className="challenge-progress-btn" onClick={() => onIncrement?.(1)}>
            {t('retos.progress')}
          </button>
          <button type="button" className="challenge-progress-btn complete" onClick={onComplete}>
            {t('retos.markComplete')}
          </button>
        </div>
      )}

      <button
        type="button"
        className={`challenge-activate-btn${isActive ? ' active' : ''}`}
        onClick={handleActivate}
        disabled={!isActive && !canActivate && !locked}
      >
        {locked && '🔒 '}
        {isActive ? t('retos.deactivate') : (canActivate ? t('retos.activate') : t('retos.limitReached'))}
      </button>
    </article>
  );
}
