import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import type { Movie } from '../../types/movie';
import { MovieSpine } from './MovieSpine';
import { listVariants } from '../../styles/animations';

interface MovieListProps {
  movies: Movie[];
  onSelect: (id: string, element: HTMLElement, colors: { bg: string; accent: string }, rotation: number) => void;
  selectedId: string | null;
}

const ListContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: 80px 40px 80px 80px;
  align-items: center;
  min-height: 100%;
`;

export function MovieList({ movies, onSelect, selectedId }: MovieListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemPositions, setItemPositions] = useState<number[]>([]);

  useEffect(() => {
    let rafId: number;

    const updatePositions = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const viewportHeight = window.innerHeight;

      const positions = movies.map((_, index) => {
        const item = container.children[index] as HTMLElement;
        if (!item) return 0.5;

        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;

        // Calculate progress: 0 = top of viewport, 1 = bottom of viewport
        // Use easing for smoother visual effect
        const rawProgress = itemCenter / viewportHeight;
        const progress = Math.max(0, Math.min(1, rawProgress));
        return progress;
      });

      setItemPositions(positions);
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePositions);
    };

    updatePositions();

    const parent = containerRef.current?.parentElement;
    if (parent) {
      parent.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });

      return () => {
        cancelAnimationFrame(rafId);
        parent.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [movies.length]);

  return (
    <ListContainer
      ref={containerRef}
      variants={listVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {movies.map((movie, index) => (
        <MovieSpine
          key={movie.id}
          movie={movie}
          index={index}
          onSelect={onSelect}
          isSelected={selectedId === movie.id}
          scrollProgress={itemPositions[index] ?? 0.5}
          totalItems={movies.length}
          layoutId={`book-wrapper-${movie.id}`}
        />
      ))}
    </ListContainer>
  );
}
