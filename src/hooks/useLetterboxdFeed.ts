import { useState, useCallback } from 'react';
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

export function useLetterboxdFeed(): UseLetterboxdFeedResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

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
      setUsername(trimmed);
      localStorage.setItem(STORAGE_KEY, trimmed);
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
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { movies, isLoading, error, username, loadUser, clearUser };
}
