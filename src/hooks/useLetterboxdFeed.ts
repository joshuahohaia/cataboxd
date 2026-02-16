import { useState, useEffect } from 'react';
import type { Movie } from '../types/movie';
import { fetchLetterboxdFeed } from '../services/rssParser';

interface UseLetterboxdFeedResult {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLetterboxdFeed(): UseLetterboxdFeedResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchLetterboxdFeed();
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { movies, isLoading, error, refetch: fetchData };
}
