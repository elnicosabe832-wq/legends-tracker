import { useCallback, useEffect, useState } from 'react';
import {
  getUserLikedChallengeIds,
  toggleUserChallengeLike,
  getDisplayLikeCount,
  COMMUNITY_LIKES_EVENT,
} from '../lib/communityChallengeLikes';

export function useCommunityChallengeLikes() {
  const [likedIds, setLikedIds] = useState(() => getUserLikedChallengeIds());

  useEffect(() => {
    const refresh = () => setLikedIds(getUserLikedChallengeIds());
    window.addEventListener(COMMUNITY_LIKES_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(COMMUNITY_LIKES_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const toggleLike = useCallback((postId) => {
    const isLiked = toggleUserChallengeLike(postId);
    setLikedIds(getUserLikedChallengeIds());
    return isLiked;
  }, []);

  const isLiked = useCallback((postId) => likedIds.has(postId), [likedIds]);

  const likeCount = useCallback(
    (post) => getDisplayLikeCount(post, likedIds),
    [likedIds],
  );

  return { likedIds, toggleLike, isLiked, likeCount };
}
