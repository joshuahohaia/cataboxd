import { useRef, memo, useMemo } from 'react';
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

// Export constants for App.tsx floating book (desktop values)
export const SPINE_LENGTH = 380;
export const BOOK_THICKNESS = 14;
export const COVER_WIDTH = 280;

// Era types for case styling
type MediaEra = 'bluray' | 'dvd' | 'early-dvd' | 'vhs' | 'vintage';

function getMediaEra(year: number): MediaEra {
  if (year >= 2010) return 'bluray';
  if (year >= 2000) return 'dvd';
  if (year >= 1995) return 'early-dvd';
  if (year >= 1980) return 'vhs';
  return 'vintage';
}

// Case configurations per era
interface CaseStyle {
  thickness: number;
  caseColor: string;
  edgeTexture: string;      // texture overlay for edges
  spineTexture: string;     // texture for spine
  coverOverlay: string;     // overlay on cover (plastic sheen etc)
}

const caseStyles: Record<MediaEra, CaseStyle> = {
  bluray: {
    thickness: 0.85,
    caseColor: '#0d2840',
    // Blu-ray: sleek blue plastic with shine
    edgeTexture: `
      linear-gradient(180deg, rgba(80,140,200,0.4) 0%, rgba(40,80,120,0.2) 50%, rgba(20,40,60,0.3) 100%),
      linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)
    `,
    spineTexture: `
      linear-gradient(90deg, rgba(255,255,255,0.15) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.2) 100%)
    `,
    coverOverlay: `
      linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.1) 100%)
    `,
  },
  dvd: {
    thickness: 1,
    caseColor: '#111111',
    // DVD: black plastic with subtle sheen
    edgeTexture: `
      linear-gradient(180deg, rgba(60,60,60,0.5) 0%, rgba(30,30,30,0.3) 50%, rgba(10,10,10,0.4) 100%),
      linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)
    `,
    spineTexture: `
      linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.3) 100%)
    `,
    coverOverlay: `
      linear-gradient(120deg, rgba(255,255,255,0.12) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.08) 100%)
    `,
  },
  'early-dvd': {
    thickness: 1.15,
    caseColor: '#1a1815',
    // Early DVD: matte plastic, less sheen
    edgeTexture: `
      linear-gradient(180deg, rgba(50,45,40,0.4) 0%, rgba(25,22,20,0.3) 100%)
    `,
    spineTexture: `
      linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.2) 100%)
    `,
    coverOverlay: `
      linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)
    `,
  },
  vhs: {
    thickness: 1.7,
    caseColor: '#201c18',
    // VHS: cardboard texture, worn look
    edgeTexture: `
      repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 4px),
      linear-gradient(180deg, rgba(60,50,40,0.3) 0%, rgba(30,25,20,0.4) 100%)
    `,
    spineTexture: `
      repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, transparent 1px, transparent 3px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 30%)
    `,
    coverOverlay: 'none',
  },
  vintage: {
    thickness: 1.5,
    caseColor: '#2a2420',
    // Vintage: aged cardboard/paper
    edgeTexture: `
      repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 3px),
      repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 5px),
      linear-gradient(180deg, rgba(80,60,40,0.2) 0%, rgba(40,30,20,0.3) 100%)
    `,
    spineTexture: `
      repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 2px)
    `,
    coverOverlay: 'none',
  },
};

export { getMediaEra };
export type { MediaEra };

const BookWrapper = styled(motion.div)`
  perspective: 1000px;
  cursor: pointer;
  height: var(--book-wrapper-height);
  margin-bottom: var(--book-margin-bottom);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  will-change: transform;
  -webkit-tap-highlight-color: transparent;
`;

const Book3D = styled.div<{ $rotation: number; $thickness: number }>`
  position: relative;
  width: var(--spine-length);
  height: calc(var(--book-thickness) * ${props => props.$thickness});
  transform-style: preserve-3d;
  transform: rotateX(${props => props.$rotation}deg);
  transition: transform 0.1s ease-out;
  will-change: transform;

  &:hover {
    transform: rotateX(${props => props.$rotation}deg) translateZ(20px);
  }
`;

const Face = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  backface-visibility: hidden;
`;

const FaceFront = styled(Face)<{ $bgColor: string; $thickness: number; $spineTexture: string }>`
  width: var(--spine-length);
  height: calc(var(--book-thickness) * ${props => props.$thickness});
  margin-left: calc(var(--spine-length) / -2);
  margin-top: calc(var(--book-thickness) * ${props => props.$thickness} / -2);
  background: ${props => props.$bgColor};
  display: flex;
  align-items: center;
  padding: 0 12px;
  transform: translateZ(calc(var(--cover-width) / 2));

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.$spineTexture};
    pointer-events: none;
    border-radius: inherit;
  }

  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const FaceBack = styled(Face)<{ $bgColor: string; $thickness: number }>`
  width: var(--spine-length);
  height: calc(var(--book-thickness) * ${props => props.$thickness});
  margin-left: calc(var(--spine-length) / -2);
  margin-top: calc(var(--book-thickness) * ${props => props.$thickness} / -2);
  background: ${props => props.$bgColor};
  transform: rotateY(180deg) translateZ(calc(var(--cover-width) / 2));
`;

const FaceTop = styled(Face)<{ $bgColor: string; $thickness: number; $coverOverlay: string }>`
  width: var(--spine-length);
  height: var(--cover-width);
  margin-left: calc(var(--spine-length) / -2);
  margin-top: calc(var(--cover-width) / -2);
  background-color: ${props => props.$bgColor};
  transform: rotateX(90deg) translateZ(calc(var(--book-thickness) * ${props => props.$thickness} / 2));
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.$coverOverlay};
    pointer-events: none;
    z-index: 2;
  }
`;

const FaceBottom = styled(Face)<{ $bgColor: string; $thickness: number }>`
  width: var(--spine-length);
  height: var(--cover-width);
  margin-left: calc(var(--spine-length) / -2);
  margin-top: calc(var(--cover-width) / -2);
  background: ${props => props.$bgColor};
  transform: rotateX(-90deg) translateZ(calc(var(--book-thickness) * ${props => props.$thickness} / 2));
`;

const FaceLeft = styled(Face)<{ $caseColor: string; $thickness: number; $edgeTexture: string }>`
  width: var(--cover-width);
  height: calc(var(--book-thickness) * ${props => props.$thickness});
  margin-left: calc(var(--cover-width) / -2);
  margin-top: calc(var(--book-thickness) * ${props => props.$thickness} / -2);
  background: ${props => props.$caseColor};
  transform: rotateY(-90deg) translateZ(calc(var(--spine-length) / 2));

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.$edgeTexture};
    pointer-events: none;
  }
`;

const FaceRight = styled(Face)<{ $caseColor: string; $thickness: number; $edgeTexture: string }>`
  width: var(--cover-width);
  height: calc(var(--book-thickness) * ${props => props.$thickness});
  margin-left: calc(var(--cover-width) / -2);
  margin-top: calc(var(--book-thickness) * ${props => props.$thickness} / -2);
  background: ${props => props.$caseColor};
  transform: rotateY(90deg) translateZ(calc(var(--spine-length) / 2));

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => props.$edgeTexture};
    pointer-events: none;
  }
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

  @media (max-width: 768px) {
    font-size: 8px;
    display: none;
  }
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

  @media (max-width: 768px) {
    font-size: 9px;
    margin: 0 8px;
  }
`;

const Logo = styled.div`
  opacity: 0.4;
  color: white;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    svg {
      width: 10px;
      height: 10px;
    }
  }
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

export const MovieSpine = memo(function MovieSpine({
  movie,
  index,
  onSelect,
  isSelected,
  scrollProgress = 0.5,
  totalItems,
  layoutId
}: MovieSpineProps) {
  const colors = useImageColor(movie.posterUrl, index, movie.filmTitle);
  const bookRef = useRef<HTMLDivElement>(null);

  const watchedDate = useMemo(() => formatWatchedDate(movie.watchedDate), [movie.watchedDate]);

  // Get era-based case styling
  const era = useMemo(() => getMediaEra(movie.filmYear || 2000), [movie.filmYear]);
  const caseStyle = caseStyles[era];

  // Dynamic rotation based on scroll position
  const rotation = useMemo(() => {
    const minRotation = -30;
    const maxRotation = -5;
    return minRotation + (scrollProgress * (maxRotation - minRotation));
  }, [scrollProgress]);

  const handleClick = () => {
    if (bookRef.current) {
      onSelect(movie.id, bookRef.current, colors, rotation);
    }
  };

  return (
    <BookWrapper
      onClick={handleClick}
      layoutId={layoutId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        zIndex: totalItems - index,
        pointerEvents: isSelected ? 'none' : 'auto',
        visibility: isSelected ? 'hidden' : 'visible',
      }}
    >
      <Book3D ref={bookRef} $rotation={rotation} $thickness={caseStyle.thickness}>
        <FaceFront $bgColor={colors.bg} $thickness={caseStyle.thickness} $spineTexture={caseStyle.spineTexture}>
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
        <FaceBack $bgColor={colors.bg} $thickness={caseStyle.thickness} />
        <FaceTop $bgColor={colors.bg} $thickness={caseStyle.thickness} $coverOverlay={caseStyle.coverOverlay}>
          {movie.posterUrl && <PosterImage src={movie.posterUrl} alt={movie.filmTitle} loading="lazy" />}
        </FaceTop>
        <FaceBottom $bgColor={colors.bg} $thickness={caseStyle.thickness} />
        <FaceLeft $caseColor={caseStyle.caseColor} $thickness={caseStyle.thickness} $edgeTexture={caseStyle.edgeTexture} />
        <FaceRight $caseColor={caseStyle.caseColor} $thickness={caseStyle.thickness} $edgeTexture={caseStyle.edgeTexture} />
      </Book3D>
    </BookWrapper>
  );
});

export { useImageColor };
