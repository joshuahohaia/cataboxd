import { motion } from 'framer-motion';
import styled from 'styled-components';
import type { Movie } from '../../types/movie';
import { PosterDisplay } from './PosterDisplay';
import { MovieInfo } from './MovieInfo';
import { detailVariants } from '../../styles/animations';

interface MovieDetailProps {
  movie: Movie;
  onBack: () => void;
}

const DetailContainer = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  overflow: auto;
  z-index: 10;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 60px;
  max-width: 1000px;
  width: 100%;
  align-items: flex-start;
`;

const PosterSection = styled.div`
  flex-shrink: 0;
`;

const InfoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ReviewText = styled(motion.div)`
  font-size: 16px;
  line-height: 1.8;
  color: rgba(0, 0, 0, 0.7);
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 40px;
  left: 40px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ExternalLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  padding: 10px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  transition: background 0.2s, border-color 0.2s;
  width: fit-content;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.4);
  }
`;

export function MovieDetail({ movie, onBack }: MovieDetailProps) {
  return (
    <DetailContainer
      variants={detailVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <BackButton
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </BackButton>

      <ContentWrapper>
        <PosterSection>
          <PosterDisplay src={movie.posterUrl} title={movie.filmTitle} />
        </PosterSection>

        <InfoSection>
          <MovieInfo movie={movie} />

          {movie.review && (
            <ReviewText
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {movie.review}
            </ReviewText>
          )}

          {movie.link && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <ExternalLink href={movie.link} target="_blank" rel="noopener noreferrer">
                View on Letterboxd
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </ExternalLink>
            </motion.div>
          )}
        </InfoSection>
      </ContentWrapper>
    </DetailContainer>
  );
}
