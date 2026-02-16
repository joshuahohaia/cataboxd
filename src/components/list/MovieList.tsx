import { motion } from 'framer-motion';
import styled from 'styled-components';
import type { Movie } from '../../types/movie';
import { MovieSpine } from './MovieSpine';
import { listVariants } from '../../styles/animations';

interface MovieListProps {
  movies: Movie[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const ListContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 80px 40px 80px 60px;
  align-items: center;
  min-height: 100%;
`;

export function MovieList({ movies, onSelect, selectedId }: MovieListProps) {
  return (
    <ListContainer
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
          onClick={() => onSelect(movie.id)}
          isSelected={selectedId === movie.id}
        />
      ))}
    </ListContainer>
  );
}
