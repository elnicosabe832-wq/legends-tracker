const STORAGE_KEY = 'legends-tracker-community-likes';
export const COMMUNITY_LIKES_EVENT = 'legends-community-likes-updated';

function readLikedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeLikedIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COMMUNITY_LIKES_EVENT, { detail: ids }));
  }
}

export function getUserLikedChallengeIds() {
  return new Set(readLikedIds());
}

export function setUserLikedChallengeIds(ids) {
  const unique = [...new Set((ids || []).filter((id) => typeof id === 'string'))];
  writeLikedIds(unique);
  return unique;
}

/** @returns {boolean} nuevo estado: true = liked */
export function toggleUserChallengeLike(postId) {
  const set = new Set(readLikedIds());
  if (set.has(postId)) {
    set.delete(postId);
  } else {
    set.add(postId);
  }
  writeLikedIds([...set]);
  return set.has(postId);
}

export function getDisplayLikeCount(post, likedIds) {
  const base = post.likes || 0;
  return base + (likedIds.has(post.id) ? 1 : 0);
}
