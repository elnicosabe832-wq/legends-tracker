import { useTranslation } from 'react-i18next';

const DIFFICULTY_CLASS = {
  easy: 'easy',
  medium: 'medium',
  legend: 'legend',
};

export default function CommunityChallengeCard({ post, isLiked, likeCount, onToggleLike }) {
  const { t, i18n } = useTranslation();
  const key = `retos.feed.posts.${post.contentKey}`;
  const title = t(`${key}.title`);
  const description = t(`${key}.description`);
  const rules = t(`${key}.rules`, { returnObjects: true });
  const diffClass = DIFFICULTY_CLASS[post.difficulty] || 'medium';
  const difficultyLabel = t(`retos.difficulty.${post.difficulty}`);

  const dateLabel = new Date(post.createdAt).toLocaleDateString(
    i18n.language?.startsWith('en') ? 'en-GB' : 'es-ES',
    { day: 'numeric', month: 'short', year: 'numeric' },
  );

  return (
    <article className={`community-challenge-card challenge-${diffClass}`}>
      <header className="community-challenge-header">
        <div className="community-challenge-meta">
          <span className={`challenge-difficulty challenge-diff-${diffClass}`}>
            {difficultyLabel}
          </span>
          <span className="community-challenge-team">⚽ {post.team}</span>
        </div>
        <time className="community-challenge-date" dateTime={post.createdAt}>
          {t('retos.feed.postedOn', { date: dateLabel })}
        </time>
      </header>

      <div className="community-challenge-author">
        <span className="community-author-avatar" aria-hidden="true">
          {post.author.charAt(0).toUpperCase()}
        </span>
        <div>
          <strong>{post.author}</strong>
          {post.author === 'Admin' && (
            <span className="community-admin-badge">{t('retos.feed.adminBadge')}</span>
          )}
        </div>
      </div>

      <h3 className="community-challenge-title">{title}</h3>
      <p className="community-challenge-desc">{description}</p>

      {Array.isArray(rules) && rules.length > 0 && (
        <div className="community-challenge-rules">
          <h4>{t('retos.feed.rulesTitle')}</h4>
          <ul>
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      <footer className="community-challenge-footer">
        <button
          type="button"
          className={`community-like-btn${isLiked ? ' liked' : ''}`}
          onClick={() => onToggleLike(post.id)}
          aria-pressed={isLiked}
        >
          <span aria-hidden="true">{isLiked ? '❤️' : '🤍'}</span>
          <span>{likeCount}</span>
          <span className="community-like-label">{t('retos.feed.likes')}</span>
        </button>
      </footer>
    </article>
  );
}
