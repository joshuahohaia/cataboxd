import { motion } from 'framer-motion';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import type { Movie } from '../../types/movie';
import { theme } from '../../styles/theme';
import { spineVariants } from '../../styles/animations';

interface MovieSpineProps {
  movie: Movie;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}

const SpineWrapper = styled(motion.div)`
  perspective: 1000px;
  cursor: pointer;
  width: 100%;
  max-width: 700px;
`;

const SpineContainer = styled.div<{ $color: string }>`
  position: relative;
  height: 70px;
  transform-style: preserve-3d;
  transform: rotateX(-8deg) rotateY(-3deg);
  transition: transform 0.3s ease;

  &:hover {
    transform: rotateX(-5deg) rotateY(-1deg) scale(1.02);
  }
`;

const SpineFace = styled.div<{ $color: string }>`
  position: absolute;
  inset: 0;
  background: ${(props) => props.$color};
  transform: translateZ(10px);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
`;

const SpineTop = styled.div<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(
    to bottom,
    ${(props) => lighten(0.08, props.$color)},
    ${(props) => props.$color}
  );
  transform: rotateX(90deg) translateZ(0);
  transform-origin: top;
  border-radius: 3px 3px 0 0;
`;

const SpineBottom = styled.div<{ $color: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: ${(props) => darken(0.1, props.$color)};
  transform: rotateX(-90deg) translateZ(0);
  transform-origin: bottom;
  border-radius: 0 0 3px 3px;
`;

const SpineRight = styled.div<{ $color: string }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 10px;
  background: ${(props) => darken(0.05, props.$color)};
  transform: rotateY(90deg) translateZ(0);
  transform-origin: right;
`;

const Director = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  text-transform: capitalize;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: white;
  text-align: right;
  flex: 1;
  margin-left: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Logo = styled.div`
  width: 30px;
  height: 30px;
  margin-left: 20px;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
`;

function getSpineColor(index: number): string {
  return theme.spineColors[index % theme.spineColors.length];
}

export function MovieSpine({ movie, index, onClick, isSelected }: MovieSpineProps) {
  const color = getSpineColor(index);

  return (
    <SpineWrapper
      layoutId={`movie-${movie.id}`}
      variants={spineVariants}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      style={{ opacity: isSelected ? 0 : 1 }}
    >
      <SpineContainer $color={color}>
        <SpineTop $color={color} />
        <SpineFace $color={color}>
          <Director>{movie.filmYear}</Director>
          <Title>{movie.filmTitle}</Title>
          <Logo>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </Logo>
        </SpineFace>
        <SpineBottom $color={color} />
        <SpineRight $color={color} />
      </SpineContainer>
    </SpineWrapper>
  );
}
