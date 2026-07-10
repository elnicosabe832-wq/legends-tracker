const STORAGE_KEY = 'legends-tracker-community-likes';

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
}

export function getUserLikedChallengeIds() {
  return new Set(readLikedIds());
}

/** @returns {boolean} nuevo estado: true = liked */
export function toggleUserChallengeLike(postId) {
  const ids = readLikedIds();
  const set = new Set(ids);
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
