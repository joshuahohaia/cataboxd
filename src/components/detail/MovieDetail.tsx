import { motion } from 'framer-motion';
import styled from 'styled-components';
import type { Movie } from '../../types/movie';
import { getMovieColor } from '../../hooks/useImageColor';

interface MovieDetailProps {
  movie: Movie;
  index: number;
  onBack: () => void;
}

const DetailOverlay = styled(motion.div)<{ $bgColor: string }>`
  position: fixed;
  inset: 0;
  background: ${(props) => props.$bgColor};
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  overflow: hidden;
`;

const ContentWrapper = styled(motion.div)`
  display: flex;
  gap: 60px;
  max-width: 1000px;
  width: 100%;
  align-items: center;
`;

const BookWrapper = styled(motion.div)`
  flex-shrink: 0;
  perspective: 1200px;
`;

const Book = styled(motion.div)`
  position: relative;
  width: 260px;
  height: 380px;
  transform-style: preserve-3d;
`;

const BookCover = styled(motion.div)<{ $posterUrl: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${(props) => props.$posterUrl ? `url(${props.$posterUrl})` : '#333'};
  background-size: cover;
  background-position: center;
  border-radius: 2px 6px 6px 2px;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.3);
`;

const BookSpine = styled(motion.div)<{ $color: string }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 25px;
  height: 100%;
  background: ${(props) => props.$color};
  transform: rotateY(-90deg) translateZ(12.5px);
  transform-origin: left;
  border-radius: 2px 0 0 2px;
`;

const InfoSection = styled(motion.div)`
  flex: 1;
  color: white;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 24px 0;
  font-style: italic;
`;

const ReviewText = styled.div`
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 24px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const MetaRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
`;

const Badge = styled.span`
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
`;

const Rating = styled.span`
  color: #ffd700;
  font-size: 20px;
  letter-spacing: 2px;
`;

const ExternalLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 40px;
  left: 40px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

function renderStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return '\u2605'.repeat(fullStars) + (hasHalf ? '\u00BD' : '');
}

export function MovieDetail({ movie, index, onBack }: MovieDetailProps) {
  const colors = getMovieColor(movie.filmTitle, index);

  return (
    <DetailOverlay
      $bgColor={colors.bg}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BackButton
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </BackButton>

      <ContentWrapper>
        <BookWrapper>
          <Book
            initial={{
              rotateX: 60,
              rotateY: 0,
              y: 100,
              opacity: 0,
            }}
            animate={{
              rotateX: 5,
              rotateY: -15,
              y: 0,
              opacity: 1,
            }}
            exit={{
              rotateX: 60,
              rotateY: 0,
              y: 100,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <BookSpine $color={colors.accent} />
            <BookCover $posterUrl={movie.posterUrl} />
          </Book>
        </BookWrapper>

        <InfoSection
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Title>{movie.filmTitle}</Title>
          <Subtitle>{movie.filmYear}</Subtitle>

          <MetaRow>
            {movie.memberRating > 0 && (
              <Rating>{renderStars(movie.memberRating)}</Rating>
            )}
            {movie.isRewatch && <Badge>Rewatch</Badge>}
            {movie.isLiked && <Badge>Liked</Badge>}
          </MetaRow>

          {movie.review && (
            <ReviewText>{movie.review}</ReviewText>
          )}

          {movie.link && (
            <ExternalLink href={movie.link} target="_blank" rel="noopener noreferrer">
              View on Letterboxd
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </ExternalLink>
          )}
        </InfoSection>
      </ContentWrapper>
    </DetailOverlay>
  );
}
