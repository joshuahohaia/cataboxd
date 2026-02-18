import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import type { Movie } from '../../types/movie';
import { MovieSpine } from './MovieSpine';

interface MovieListProps {
  movies: Movie[];
  onSelect: (id: string, element: HTMLElement, colors: { bg: string; accent: string }, rotation: number) => void;
  selectedId: string | null;
}

const ListContainer = styled(motion.div)`
  padding: var(--list-padding) 40px var(--list-padding) var(--list-padding-left);
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: var(--list-padding) 16px;
  }
`;

const VirtualContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const VirtualItem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
`;

// Effective item height: wrapper height + margin
const ITEM_HEIGHT = 30; // 100px - 70px overlap

export function MovieList({ movies, onSelect, selectedId }: MovieListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current?.parentElement ?? null,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Calculate scroll progress for an item based on its position in viewport
  const getScrollProgress = useCallback((index: number) => {
    if (!parentRef.current?.parentElement) return 0.5;

    const scrollElement = parentRef.current.parentElement;
    const scrollTop = scrollElement.scrollTop;
    const viewportHeight = scrollElement.clientHeight;
    const listPadding = 80; // top padding

    // Calculate item's position relative to viewport
    const itemTop = listPadding + (index * ITEM_HEIGHT) - scrollTop;
    const itemCenter = itemTop + (ITEM_HEIGHT / 2);

    // Progress: 0 = top, 1 = bottom
    const progress = itemCenter / viewportHeight;
    return Math.max(0, Math.min(1, progress));
  }, []);

  return (
    <ListContainer
      ref={parentRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <VirtualContainer
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualItem) => {
          const movie = movies[virtualItem.index];
          return (
            <VirtualItem
              key={movie.id}
              style={{
                transform: `translateY(${virtualItem.start}px)`,
                zIndex: movies.length - virtualItem.index,
              }}
            >
              <MovieSpine
                movie={movie}
                index={virtualItem.index}
                onSelect={onSelect}
                isSelected={selectedId === movie.id}
                scrollProgress={getScrollProgress(virtualItem.index)}
                totalItems={movies.length}
                layoutId={`book-wrapper-${movie.id}`}
              />
            </VirtualItem>
          );
        })}
      </VirtualContainer>
    </ListContainer>
  );
}
