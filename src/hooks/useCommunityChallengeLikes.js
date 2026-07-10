import { useCallback, useState } from 'react';
import {
  getUserLikedChallengeIds,
  toggleUserChallengeLike,
  getDisplayLikeCount,
} from '../lib/communityChallengeLikes';

export function useCommunityChallengeLikes() {
  const [likedIds, setLikedIds] = useState(() => getUserLikedChallengeIds());

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
