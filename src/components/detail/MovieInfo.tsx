import styled from 'styled-components';
import { motion } from 'framer-motion';
import type { Movie } from '../../types/movie';

interface MovieInfoProps {
  movie: Movie;
}

const InfoContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const Stars = styled.span`
  color: #f5c518;
  font-size: 18px;
  letter-spacing: 2px;
`;

const RatingNumber = styled.span`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
`;

const MetaBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  background: #1a1a1a;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

function renderStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let stars = '';

  for (let i = 0; i < fullStars; i++) {
    stars += '\u2605'; // filled star
  }
  if (hasHalf) {
    stars += '\u00BD'; // half symbol
  }

  return stars || '-';
}

export function MovieInfo({ movie }: MovieInfoProps) {
  return (
    <InfoContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <Title>{movie.filmTitle}</Title>
      <Subtitle>{movie.filmYear}</Subtitle>

      {movie.memberRating > 0 && (
        <Rating>
          <Stars>{renderStars(movie.memberRating)}</Stars>
          <RatingNumber>{movie.memberRating.toFixed(1)}</RatingNumber>
        </Rating>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        {movie.isRewatch && <MetaBadge>Rewatch</MetaBadge>}
        {movie.isLiked && <MetaBadge>Liked</MetaBadge>}
      </div>
    </InfoContainer>
  );
}
