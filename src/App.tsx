import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { useLetterboxdFeed } from './hooks/useLetterboxdFeed';
import { useMovieSelection } from './hooks/useMovieSelection';
import { Sidebar } from './components/layout/Sidebar';
import { MovieList } from './components/list/MovieList';
import { MovieDetail } from './components/detail/MovieDetail';
import { UserInput } from './components/UserInput';
import styled from 'styled-components';

const AppWrapper = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
`;

const Background = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const ScrollContainer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  gap: 16px;
`;

const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: white;
  border-radius: 50%;
`;

const LoadingText = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

const ChangeUserButton = styled(motion.button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  z-index: 100;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

function App() {
  const { movies, isLoading, error, username, loadUser, clearUser } = useLetterboxdFeed();
  const { selectedMovie, selectedId, select, deselect } = useMovieSelection(movies);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  // Auto-load saved username on mount
  useEffect(() => {
    if (username && movies.length === 0 && !isLoading && !error) {
      loadUser(username);
    }
  }, []);

  // Track scroll position to update sidebar
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || movies.length === 0) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      if (scrollHeight <= 0) return;

      const scrollPercent = scrollTop / scrollHeight;
      const index = Math.round(scrollPercent * (movies.length - 1));
      setScrollIndex(index);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [movies.length]);

  const isDarkMode = !selectedMovie;
  const showUserInput = !username || (error && movies.length === 0);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppWrapper>
        <Background
          animate={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        <Sidebar
          totalItems={movies.length}
          currentIndex={scrollIndex}
          isVisible={isDarkMode && !isLoading && !showUserInput && movies.length > 0}
        />

        <ScrollContainer ref={scrollRef}>
          {showUserInput && !isLoading ? (
            <UserInput
              onSubmit={loadUser}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <>
              {isLoading && (
                <LoadingContainer>
                  <LoadingSpinner
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <LoadingText>Loading {username}'s diary...</LoadingText>
                </LoadingContainer>
              )}

              {!isLoading && movies.length > 0 && (
                <>
                  <AnimatePresence>
                    {!selectedMovie && (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <MovieList
                          movies={movies}
                          onSelect={select}
                          selectedId={selectedId}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {selectedMovie && (
                      <MovieDetail
                        key="detail"
                        movie={selectedMovie}
                        onBack={deselect}
                      />
                    )}
                  </AnimatePresence>
                </>
              )}
            </>
          )}
        </ScrollContainer>

        {isDarkMode && username && movies.length > 0 && !isLoading && (
          <ChangeUserButton
            onClick={clearUser}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            @{username}
          </ChangeUserButton>
        )}
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
