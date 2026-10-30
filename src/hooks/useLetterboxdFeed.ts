import { useState, useCallback, useEffect, useRef } from 'react';
import type { Movie } from '../types/movie';
import { fetchLetterboxdFeed } from '../services/rssParser';
import {
  getCachedMovies,
  setCachedMovies,
  clearCachedMovies,
  getCacheTime,
  isCacheStale,
} from '../services/feedCache';

interface UseLetterboxdFeedResult {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  username: string | null;
  loadUser: (username: string, options?: LoadUserOptions) => Promise<void>;
  refresh: () => Promise<void>;
  clearUser: () => void;
}

const STORAGE_KEY = 'cataboxd_username';

interface LoadUserOptions {
  /**
   * Keep the currently displayed movies when the fetch fails. Used by
   * background revalidation so a transient error does not blank the list.
   */
  preserveMoviesOnError?: boolean;
}

export function useLetterboxdFeed(): UseLetterboxdFeedResult {
  const [movies, setMovies] = useState<Movie[]>(() => getCachedMovies() || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const hasFetched = useRef(false);

  const loadUser = useCallback(async (newUsername: string, options: LoadUserOptions = {}) => {
    const { preserveMoviesOnError = false } = options;
    const trimmed = newUsername.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchLetterboxdFeed(trimmed);
      setMovies(data);
      setCachedMovies(data);
      setUsername(trimmed);
      localStorage.setItem(STORAGE_KEY, trimmed);
      hasFetched.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
      if (!preserveMoviesOnError) {
        setMovies([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUsername(null);
    setMovies([]);
    setError(null);
    clearCachedMovies();
    localStorage.removeItem(STORAGE_KEY);
    hasFetched.current = false;
  }, []);

  // Auto-load on mount if we have a username but no cached movies
  useEffect(() => {
    if (username && movies.length === 0 && !hasFetched.current) {
      hasFetched.current = true;
      loadUser(username);
    }
  }, [username, movies.length, loadUser]);

  // Revalidate while the app stays open. The TTL was previously only checked
  // when the hook initialised, so a session left open past the cache duration
  // kept showing stale movies until a full reload.
  useEffect(() => {
    if (!username) return;

    const revalidateIfStale = () => {
      if (isCacheStale(getCacheTime())) {
        loadUser(username, { preserveMoviesOnError: true });
      }
    };

    window.addEventListener('focus', revalidateIfStale);
    const intervalId = setInterval(revalidateIfStale, 60 * 1000);
    return () => {
      window.removeEventListener('focus', revalidateIfStale);
      clearInterval(intervalId);
    };
  }, [username, loadUser]);

  const refresh = useCallback(async () => {
    if (username) {
      await loadUser(username, { preserveMoviesOnError: true });
    }
  }, [username, loadUser]);

  return { movies, isLoading, error, username, loadUser, refresh, clearUser };
}
