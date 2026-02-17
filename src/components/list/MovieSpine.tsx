import { useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import type { Movie } from '../../types/movie';
import { useImageColor } from '../../hooks/useImageColor';

interface MovieSpineProps {
  movie: Movie;
  index: number;
  onSelect: (id: string, element: HTMLElement, colors: { bg: string; accent: string }, rotation: number) => void;
  isSelected: boolean;
  scrollProgress?: number;
  totalItems: number;
  layoutId: string;
}

// DVD case proportions - more square/wide
const SPINE_LENGTH = 380;    // Width when lying flat
const BOOK_THICKNESS = 14;   // Height when lying flat
const COVER_WIDTH = 280;     // Depth - the cover art dimension

const BookWrapper = styled(motion.div)`
  perspective: 1000px;
  cursor: pointer;
  height: 100px;
  margin-bottom: -70px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Book3D = styled(motion.div)`
  position: relative;
  width: ${SPINE_LENGTH}px;
  height: ${BOOK_THICKNESS}px;
  transform-style: preserve-3d;
`;

const Face = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
`;

// Front face - spine with title
const FaceFront = styled(Face) <{ $bgColor: string }>`
  width: ${SPINE_LENGTH}px;
  height: ${BOOK_THICKNESS}px;
  margin-left: -${SPINE_LENGTH / 2}px;
  margin-top: -${BOOK_THICKNESS / 2}px;
  background: ${(props) => props.$bgColor};
  display: flex;
  align-items: center;
  padding: 0 16px;
  transform: translateZ(${COVER_WIDTH / 2}px);
`;

// Back face
const FaceBack = styled(Face) <{ $bgColor: string }>`
  width: ${SPINE_LENGTH}px;
  height: ${BOOK_THICKNESS}px;
  margin-left: -${SPINE_LENGTH / 2}px;
  margin-top: -${BOOK_THICKNESS / 2}px;
  background: ${(props) => props.$bgColor};
  filter: brightness(0.5);
  transform: rotateY(180deg) translateZ(${COVER_WIDTH / 2}px);
`;

// Top face - the cover with poster (THIS IS WHAT YOU SEE)
const FaceTop = styled(Face) <{ $bgColor: string }>`
  width: ${SPINE_LENGTH}px;
  height: ${COVER_WIDTH}px;
  margin-left: -${SPINE_LENGTH / 2}px;
  margin-top: -${COVER_WIDTH / 2}px;
  background-color: ${(props) => props.$bgColor};
  transform: rotateX(90deg) translateZ(${BOOK_THICKNESS / 2}px);
  overflow: hidden;
`;

// Bottom face
const FaceBottom = styled(Face) <{ $bgColor: string }>`
  width: ${SPINE_LENGTH}px;
  height: ${COVER_WIDTH}px;
  margin-left: -${SPINE_LENGTH / 2}px;
  margin-top: -${COVER_WIDTH / 2}px;
  background: ${(props) => props.$bgColor};
  filter: brightness(0.3);
  transform: rotateX(-90deg) translateZ(${BOOK_THICKNESS / 2}px);
`;

// Left face
const FaceLeft = styled(Face) <{ $bgColor: string }>`
  width: ${COVER_WIDTH}px;
  height: ${BOOK_THICKNESS}px;
  margin-left: -${COVER_WIDTH / 2}px;
  margin-top: -${BOOK_THICKNESS / 2}px;
  background: ${(props) => props.$bgColor};
  filter: brightness(0.85);
  transform: rotateY(-90deg) translateZ(${SPINE_LENGTH / 2}px);
`;

// Right face
const FaceRight = styled(Face) <{ $bgColor: string }>`
  width: ${COVER_WIDTH}px;
  height: ${BOOK_THICKNESS}px;
  margin-left: -${COVER_WIDTH / 2}px;
  margin-top: -${BOOK_THICKNESS / 2}px;
  background: ${(props) => props.$bgColor};
  filter: brightness(0.7);
  transform: rotateY(90deg) translateZ(${SPINE_LENGTH / 2}px);
`;

const PosterImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: rotate(-90deg) scale(1.357);
  transform-origin: center center;
`;

const SpineContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const WatchedDate = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Title = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: right;
  margin: 0 12px;
`;

const Logo = styled.div`
  opacity: 0.4;
  color: white;
  display: flex;
  align-items: center;
`;

function formatWatchedDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  } catch {
    return dateStr;
  }
}

export function MovieSpine({ movie, index, onSelect, isSelected, scrollProgress = 0.5, totalItems, layoutId }: MovieSpineProps) {
  const colors = useImageColor(movie.posterUrl, index, movie.filmTitle);
  const watchedDate = formatWatchedDate(movie.watchedDate);
  const ref = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  // Dynamic rotation based on scroll position
  // Items at top of viewport tilt forward (show more cover)
  // Items at bottom tilt back (show more spine)
  const minRotation = -30; // Top of screen - tilted back, showing cover
  const maxRotation = -5;  // Bottom of screen - more upright, showing spine
  const rotation = minRotation + (scrollProgress * (maxRotation - minRotation));

  const handleClick = () => {
    if (bookRef.current) {
      onSelect(movie.id, bookRef.current, colors, rotation);
    }
  };

  return (
    <BookWrapper
      ref={ref}
      onClick={handleClick}
      layoutId={layoutId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        zIndex: totalItems - index,
        pointerEvents: isSelected ? 'none' : 'auto',
        visibility: isSelected ? 'hidden' : 'visible',
      }}
    >
      <Book3D
        ref={bookRef}
        animate={{ rotateX: rotation }}
        whileHover={{
          translateZ: 20,
          transition: { duration: 0.2 }
        }}
      >
        <FaceFront $bgColor={colors.bg}>
          <SpineContent>
            <WatchedDate>{watchedDate}</WatchedDate>
            <Title>{movie.filmTitle}</Title>
            <Logo>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Logo>
          </SpineContent>
        </FaceFront>
        <FaceBack $bgColor={colors.bg} />
        <FaceTop $bgColor={colors.bg}>
          {movie.posterUrl && <PosterImage src={movie.posterUrl} alt={movie.filmTitle} />}
        </FaceTop>
        <FaceBottom $bgColor={colors.bg} />
        <FaceLeft $bgColor={colors.accent} />
        <FaceRight $bgColor={colors.accent} />
      </Book3D>
    </BookWrapper>
  );
}

export { useImageColor, SPINE_LENGTH, BOOK_THICKNESS, COVER_WIDTH };
