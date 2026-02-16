import styled from 'styled-components';
import { motion } from 'framer-motion';

interface AppContainerProps {
  isDarkMode: boolean;
  children: React.ReactNode;
}

const Container = styled(motion.div)<{ $isDark: boolean }>`
  min-height: 100vh;
  width: 100%;
  background: ${(props) => (props.$isDark ? '#1a1a1a' : '#f5f5f5')};
  position: relative;
  overflow: hidden;
`;

const ScrollArea = styled.div`
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export function AppContainer({ isDarkMode, children }: AppContainerProps) {
  return (
    <Container
      $isDark={isDarkMode}
      animate={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }}
      transition={{ duration: 0.4 }}
    >
      <ScrollArea>{children}</ScrollArea>
    </Container>
  );
}
