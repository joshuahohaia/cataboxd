import styled from 'styled-components';
import { motion } from 'framer-motion';

interface SidebarProps {
  totalItems: number;
  currentIndex: number;
  isVisible: boolean;
}

const SidebarContainer = styled(motion.div)`
  position: fixed;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
`;

const Indicator = styled.div<{ $active: boolean }>`
  width: 3px;
  height: ${(props) => (props.$active ? '24px' : '12px')};
  background: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 2px;
  transition: all 0.3s ease;
`;

const Logo = styled.div`
  position: fixed;
  top: 24px;
  left: 24px;
  font-size: 24px;
  font-weight: 700;
  color: white;
  letter-spacing: -1px;
`;

export function Sidebar({ totalItems, currentIndex, isVisible }: SidebarProps) {
  if (!isVisible) return null;

  // Show max 15 indicators, centered around current
  const maxIndicators = Math.min(totalItems, 15);
  const halfMax = Math.floor(maxIndicators / 2);

  let start = Math.max(0, currentIndex - halfMax);
  const end = Math.min(totalItems, start + maxIndicators);

  if (end - start < maxIndicators) {
    start = Math.max(0, end - maxIndicators);
  }

  const indicators = [];
  for (let i = start; i < end; i++) {
    indicators.push(
      <Indicator key={i} $active={i === currentIndex} />
    );
  }

  return (
    <>
      <Logo>C</Logo>
      <SidebarContainer
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        {indicators}
      </SidebarContainer>
    </>
  );
}
