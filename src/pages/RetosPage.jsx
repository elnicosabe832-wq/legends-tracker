import { useTranslation } from 'react-i18next';
import CommunityChallengeCard from '../components/CommunityChallengeCard';
import { getCommunityChallengePosts } from '../data/communityChallenges';
import { useCommunityChallengeLikes } from '../hooks/useCommunityChallengeLikes';
import { usePageMeta } from '../hooks/usePageMeta';

export default function RetosPage() {
  const { t } = useTranslation();
  const { isLiked, likeCount, toggleLike } = useCommunityChallengeLikes();
  const posts = getCommunityChallengePosts();

  usePageMeta({
    title: t('meta.challenges'),
    description: t('meta.challengesFeedDesc'),
    path: '/retos',
  });

  return (
    <div className="page">
      <div className="retos-header">
        <h2>
          <span className="green">{t('retos.feed.title')}</span>
        </h2>
        <p>{t('retos.feed.subtitle')}</p>
        <span className="retos-feed-badge">{t('retos.feed.curated')}</span>
      </div>

      <div className="community-challenges-feed">
        {posts.map((post) => (
          <CommunityChallengeCard
            key={post.id}
            post={post}
            isLiked={isLiked(post.id)}
            likeCount={likeCount(post)}
            onToggleLike={toggleLike}
          />
        ))}
      </div>
    </div>
  );
}
