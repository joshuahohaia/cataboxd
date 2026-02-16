import styled from 'styled-components';
import { motion } from 'framer-motion';

interface PosterDisplayProps {
  src: string;
  title: string;
}

const PosterWrapper = styled.div`
  perspective: 1500px;
  transform-style: preserve-3d;
`;

const Poster = styled(motion.img)`
  max-width: 280px;
  max-height: 420px;
  object-fit: cover;
  transform: rotateY(12deg) rotateX(2deg);
  box-shadow: -25px 25px 50px rgba(0, 0, 0, 0.3),
    -10px 10px 20px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
`;

const PlaceholderPoster = styled.div`
  width: 280px;
  height: 420px;
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 48px;
  transform: rotateY(12deg) rotateX(2deg);
  box-shadow: -25px 25px 50px rgba(0, 0, 0, 0.3),
    -10px 10px 20px rgba(0, 0, 0, 0.2);
`;

export function PosterDisplay({ src, title }: PosterDisplayProps) {
  if (!src) {
    return (
      <PosterWrapper>
        <PlaceholderPoster>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </PlaceholderPoster>
      </PosterWrapper>
    );
  }

  return (
    <PosterWrapper>
      <Poster
        src={src}
        alt={title}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />
    </PosterWrapper>
  );
}
