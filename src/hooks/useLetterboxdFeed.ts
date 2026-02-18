import { useState, useCallback, useEffect, useRef } from 'react';
import type { Movie } from '../types/movie';
import { fetchLetterboxdFeed } from '../services/rssParser';

interface UseLetterboxdFeedResult {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  username: string | null;
  loadUser: (username: string) => Promise<void>;
  clearUser: () => void;
}

const STORAGE_KEY = 'cataboxd_username';
const CACHE_KEY = 'cataboxd_movies';
const CACHE_TIME_KEY = 'cataboxd_cache_time';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedMovies(): Movie[] | null {
  try {
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
    if (!cacheTime || Date.now() - parseInt(cacheTime) > CACHE_DURATION) {
      return null;
    }
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedMovies(movies: Movie[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(movies));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
}

function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
}

export function useLetterboxdFeed(): UseLetterboxdFeedResult {
  const [movies, setMovies] = useState<Movie[]>(() => getCachedMovies() || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const hasFetched = useRef(false);

  const loadUser = useCallback(async (newUsername: string) => {
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
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUsername(null);
    setMovies([]);
    setError(null);
    clearCache();
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

  return { movies, isLoading, error, username, loadUser, clearUser };
}
