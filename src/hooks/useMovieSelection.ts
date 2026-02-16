import { useState, useMemo, useCallback } from 'react';
import type { Movie } from '../types/movie';

interface UseMovieSelectionResult {
  selectedMovie: Movie | null;
  selectedId: string | null;
  selectedIndex: number;
  select: (id: string) => void;
  deselect: () => void;
  selectByIndex: (index: number) => void;
}

export function useMovieSelection(movies: Movie[]): UseMovieSelectionResult {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMovie = useMemo(
    () => movies.find((m) => m.id === selectedId) || null,
    [movies, selectedId]
  );

  const selectedIndex = useMemo(
    () => movies.findIndex((m) => m.id === selectedId),
    [movies, selectedId]
  );

  const select = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const deselect = useCallback(() => {
    setSelectedId(null);
  }, []);

  const selectByIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < movies.length) {
        setSelectedId(movies[index].id);
      }
    },
    [movies]
  );

  return {
    selectedMovie,
    selectedId,
    selectedIndex,
    select,
    deselect,
    selectByIndex,
  };
}
