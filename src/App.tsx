import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { useLetterboxdFeed } from './hooks/useLetterboxdFeed';
import { useMovieSelection } from './hooks/useMovieSelection';
import { AppContainer } from './components/layout/AppContainer';
import { Sidebar } from './components/layout/Sidebar';
import { MovieList } from './components/list/MovieList';
import { MovieDetail } from './components/detail/MovieDetail';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  font-size: 18px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  gap: 16px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: white;
  color: #1a1a1a;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: white;
  border-radius: 50%;
`;

function App() {
  const { movies, isLoading, error, refetch } = useLetterboxdFeed();
  const { selectedMovie, selectedId, select, deselect, selectedIndex } =
    useMovieSelection(movies);

  const isDarkMode = !selectedMovie;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppContainer isDarkMode={isDarkMode}>
        <Sidebar
          totalItems={movies.length}
          currentIndex={selectedIndex >= 0 ? selectedIndex : 0}
          isVisible={isDarkMode && !isLoading && !error}
        />

        {isLoading && (
          <LoadingContainer>
            <LoadingSpinner
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </LoadingContainer>
        )}

        {error && (
          <ErrorContainer>
            <p>Failed to load movies</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>{error}</p>
            <RetryButton onClick={refetch}>Try Again</RetryButton>
          </ErrorContainer>
        )}

        {!isLoading && !error && (
          <AnimatePresence mode="wait">
            {selectedMovie ? (
              <MovieDetail
                key="detail"
                movie={selectedMovie}
                onBack={deselect}
              />
            ) : (
              <MovieList
                key="list"
                movies={movies}
                onSelect={select}
                selectedId={selectedId}
              />
            )}
          </AnimatePresence>
        )}
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
