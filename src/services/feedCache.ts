import type { Movie } from '../types/movie';

const CACHE_KEY = 'cataboxd_movies';
const CACHE_TIME_KEY = 'cataboxd_cache_time';
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/** True when there is no timestamp or it is older than the cache duration. */
export function isCacheStale(
  cacheTime: number | null,
  now: number = Date.now(),
  duration: number = CACHE_DURATION
): boolean {
  if (cacheTime === null || Number.isNaN(cacheTime)) return true;
  return now - cacheTime > duration;
}

export function getCachedMovies(): Movie[] | null {
  try {
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
    if (isCacheStale(cacheTime ? parseInt(cacheTime) : null)) {
      return null;
    }
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export function setCachedMovies(movies: Movie[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(movies));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
}

export function clearCachedMovies() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
}

/** Timestamp of the last successful fetch, or null when never cached. */
export function getCacheTime(): number | null {
  const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
  return cacheTime ? parseInt(cacheTime) : null;
}
