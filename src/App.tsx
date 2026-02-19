import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import { useLetterboxdFeed } from "./hooks/useLetterboxdFeed";
import { useMovieSelection } from "./hooks/useMovieSelection";
import { Sidebar } from "./components/layout/Sidebar";
import { MovieList } from "./components/list/MovieList";
import { UserInput } from "./components/UserInput";
import {
  SPINE_LENGTH as LIST_SPINE_LENGTH,
  BOOK_THICKNESS,
  COVER_WIDTH as LIST_COVER_WIDTH,
} from "./components/list/MovieSpine";
import styled from "styled-components";
import type { Movie } from "./types/movie";

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

const ScrollContainer = styled(motion.div)`
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
  z-index: 50;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    padding: 8px 12px;
    font-size: 11px;
  }
`;

// Full screen overlay for detail view - slightly washed out for contrast
const DetailBackgroundOverlay = styled(motion.div) <{ $bgColor: string }>`
  position: fixed;
  inset: 0;
  background: ${(props) => props.$bgColor};
  filter: brightness(0.7) saturate(0.8);
  z-index: 100;
`;

// Floating book that animates between states - uses same dimensions as list spine
const FloatingBookContainer = styled(motion.div)`
  position: fixed;
  z-index: 200;
  perspective: 1000px;
  cursor: pointer;

  @media (max-width: 768px) {
    padding-top: 8vh;
    transform: scale(0.7);
    transform-origin: top left;
  }
`;

// The floating book - matches list spine dimensions exactly
const FloatingBook = styled(motion.div)`
  position: relative;
  width: ${LIST_SPINE_LENGTH}px;
  height: ${BOOK_THICKNESS}px;
  transform-style: preserve-3d;
`;

const Face = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
`;

// Front face - spine with title
const FaceFront = styled(Face) <{ $bgColor: string }>`
  width: ${LIST_SPINE_LENGTH}px;
  height: ${BOOK_THICKNESS}px;
  margin-left: -${LIST_SPINE_LENGTH / 2}px;
  margin-top: -${BOOK_THICKNESS / 2}px;
  background: ${(props) => props.$bgColor};
  display: flex;
  align-items: center;
  padding: 0 16px;
  transform: translateZ(${LIST_COVER_WIDTH / 2}px);
`;

// Back face
const FaceBack = styled(Face) <{ $bgColor: string }>`
  width: ${LIST_SPINE_LENGTH}px;
  height: ${BOOK_THICKNESS}px;
  margin-left: -${LIST_SPINE_LENGTH / 2}px;
  margin-top: -${BOOK_THICKNESS / 2}px;
  background: ${(props) => props.$bgColor};
  filter: brightness(0.5);
  transform: rotateY(180deg) translateZ(${LIST_COVER_WIDTH / 2}px);
`;

// Top face - the cover with poster
const FaceTop = styled(Face) <{ $bgColor: string }>`
  width: ${LIST_SPINE_LENGTH}px;
  height: ${LIST_COVER_WIDTH}px;
  margin-left: -${LIST_SPINE_LENGTH / 2}px;
  margin-top: -${LIST_COVER_WIDTH / 2}px;
  background: ${(props) => props.$bgColor};
  transform: rotateX(90deg) translateZ(${BOOK_THICKNESS / 2}px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PosterImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  height: ${LIST_SPINE_LENGTH}px;
  width: ${LIST_COVER_WIDTH}px;
  object-position: center;
  transform: translate(-50%, -50%) rotate(-90deg);
  background: inherit;
`;

// Bottom face
const FaceBottom = styled(Face) <{ $bgColor: string }>`
  width: ${LIST_SPINE_LENGTH}px;
  height: ${LIST_COVER_WIDTH}px;
  margin-left: -${LIST_SPINE_LENGTH / 2}px;
  margin-top: -${LIST_COVER_WIDTH / 2}px;
  background: ${(props) => props.$bgColor};
  filter: brightness(0.3);
  transform: rotateX(-90deg) translateZ(${BOOK_THICKNESS / 2}px);
`;

// Left face
const FaceLeft = styled(Face) <{ $bgColor: string }>`
  width: ${LIST_COVER_WIDTH}px;
  height: ${BOOK_THICKNESS}px;
  margin-left: -${LIST_COVER_WIDTH / 2}px;
  margin-top: -${BOOK_THICKNESS / 2}px;
  background: ${(props) => props.$bgColor};
  filter: brightness(0.85);
  transform: rotateY(-90deg) translateZ(${LIST_SPINE_LENGTH / 2}px);
`;

// Right face
const FaceRight = styled(Face) <{ $bgColor: string }>`
  width: ${LIST_COVER_WIDTH}px;
  height: ${BOOK_THICKNESS}px;
  margin-left: -${LIST_COVER_WIDTH / 2}px;
  margin-top: -${BOOK_THICKNESS / 2}px;
  background: ${(props) => props.$bgColor};
  filter: brightness(0.7);
  transform: rotateY(90deg) translateZ(${LIST_SPINE_LENGTH / 2}px);
`;

const SpineContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const SpineTitle = styled.span`
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
`;

// Detail content (text info)
const DetailOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    padding: 20px;
    align-items: flex-start;
    overflow-y: auto;
  }
`;

const DetailContent = styled(motion.div)`
  position: absolute;
  left: 480px;
  top: 15%;
  max-width: 500px;

  @media (max-width: 768px) {
    position: relative;
    left: auto;
    top: auto;
    max-width: 100%;
    width: 100%;
    padding: 0 16px;
    margin-top: 42vh;
  }
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

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 24px 0;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 14px;
    margin: 0 0 16px 0;
  }
`;

const ReviewText = styled.div`
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 13px;
    max-height: 200px;
    margin-bottom: 16px;
  }
`;

const MetaRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 16px;
  }
`;

const Badge = styled.span`
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;

  @media (max-width: 768px) {
    padding: 4px 10px;
    font-size: 11px;
  }
`;

const Rating = styled.span`
  color: #ffd700;
  font-size: 20px;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
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

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
    font-size: 13px;
  }
`;

const BackButton = styled(motion.button)`
  position: fixed;
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
  z-index: 210;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    top: 16px;
    left: 16px;
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

function renderStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return "\u2605".repeat(fullStars) + (hasHalf ? "\u00BD" : "");
}

interface ClickedBookInfo {
  movie: Movie;
  index: number;
  rect: DOMRect;
  colors: { bg: string; accent: string };
  initialRotation: number;
}

function App() {
  const { movies, isLoading, error, username, loadUser, clearUser } =
    useLetterboxdFeed();
  const { selectedId, select, deselect } = useMovieSelection(movies);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [clickedBook, setClickedBook] = useState<ClickedBookInfo | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const lastPositionRef = useRef({ startX: 0, startY: 0, startRotation: -15 });


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

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [movies.length]);

  const handleSelect = useCallback(
    (
      id: string,
      element: HTMLElement,
      colors: { bg: string; accent: string },
      rotation: number,
    ) => {
      const movie = movies.find((m) => m.id === id);
      const index = movies.findIndex((m) => m.id === id);
      if (!movie) return;

      const rect = element.getBoundingClientRect();
      // Position directly at the Book3D element's location
      const startX = rect.left;
      const startY = rect.top;
      lastPositionRef.current = { startX, startY, startRotation: rotation };

      setClickedBook({ movie, index, rect, colors, initialRotation: rotation });
      select(id);
      setShowDetail(true);
      setIsAnimatingOut(false);
    },
    [movies, select],
  );

  const handleBack = useCallback(() => {
    setShowDetail(false);
    setIsAnimatingOut(true);
    // Delay clearing the book state so exit animation can complete
    setTimeout(() => {
      deselect();
      setClickedBook(null);
      setIsAnimatingOut(false);
    }, 600);
  }, [deselect]);

  const showUserInput = !username || (error && movies.length === 0);
  const colors = clickedBook ? clickedBook.colors : null;

  // Calculate target position (left side of screen, leaving room for details)
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const targetX = isMobile
    ? (window.innerWidth - LIST_SPINE_LENGTH * 0.7) / 2
    : 100;
  const targetY = isMobile
    ? window.innerHeight * 0.15
    : window.innerHeight * 0.35;

  // Use stored position and rotation for animations (persists through exit animation)
  const { startX, startY, startRotation } = lastPositionRef.current;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppWrapper>
        <Background
          animate={{
            backgroundColor:
              clickedBook && colors && !isAnimatingOut ? colors.bg : "#1a1a1a",
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        <Sidebar
          totalItems={movies.length}
          currentIndex={scrollIndex}
          isVisible={
            !selectedId && !isLoading && !showUserInput && movies.length > 0
          }
        />

        <AnimatePresence>
          {clickedBook && colors && (
            <DetailBackgroundOverlay
              $bgColor={colors.bg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        <ScrollContainer
          ref={scrollRef}
          style={{ pointerEvents: clickedBook ? "none" : "auto" }}
        >
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
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  <LoadingText>Loading {username}'s diary...</LoadingText>
                </LoadingContainer>
              )}

              {!isLoading && movies.length > 0 && (
                <MovieList
                  movies={movies}
                  onSelect={handleSelect}
                  selectedId={selectedId}
                />
              )}
            </>
          )}
        </ScrollContainer>

        {/* Floating animated book */}

        <AnimatePresence>
          {clickedBook && colors && (
            <FloatingBookContainer
              onClick={handleBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{
                left: startX,
                top: startY,
              }}
              animate={{
                left: isAnimatingOut ? startX : targetX,
                top: isAnimatingOut ? startY : targetY,
              }}
              transition={{
                duration: 0.6,
                ease: [0.5, 1, 0.36, 1],
              }}
            >
              <FloatingBook
                initial={{ rotateX: startRotation, rotateY: 0 }}
                animate={{
                  rotateX: isAnimatingOut ? startRotation : -65,
                  rotateY: isAnimatingOut ? 0 : -90,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <FaceFront $bgColor={colors.bg}>
                  <SpineContent>
                    <SpineTitle>{clickedBook.movie.filmTitle}</SpineTitle>
                  </SpineContent>
                </FaceFront>
                <FaceBack $bgColor={colors.bg} />
                <FaceTop $bgColor={colors.accent}>
                  {clickedBook.movie.posterUrl && (
                    <PosterImage
                      src={clickedBook.movie.posterUrl}
                      alt={clickedBook.movie.filmTitle}
                    />
                  )}
                </FaceTop>
                <FaceBottom $bgColor={colors.bg} />
                <FaceLeft $bgColor={colors.accent} />
                <FaceRight $bgColor={colors.accent} />
              </FloatingBook>
            </FloatingBookContainer>
          )}
        </AnimatePresence>

        {/* Back button */}

        <AnimatePresence>
          {clickedBook && !isAnimatingOut && (
            <BackButton
              onClick={handleBack}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </BackButton>
          )}
        </AnimatePresence>

        {/* Detail text content */}

        <AnimatePresence>
          {showDetail && clickedBook && (
            <DetailOverlay>
              <DetailContent
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <InfoSection>
                  <Title>{clickedBook.movie.filmTitle}</Title>

                  <Subtitle>{clickedBook.movie.filmYear}</Subtitle>

                  <MetaRow>
                    {clickedBook.movie.memberRating > 0 && (
                      <Rating>
                        {renderStars(clickedBook.movie.memberRating)}
                      </Rating>
                    )}

                    {clickedBook.movie.isRewatch && <Badge>Rewatch</Badge>}

                    {clickedBook.movie.isLiked && <Badge>Liked</Badge>}
                  </MetaRow>

                  {clickedBook.movie.review && (
                    <ReviewText>{clickedBook.movie.review}</ReviewText>
                  )}

                  {clickedBook.movie.link && (
                    <ExternalLink
                      href={clickedBook.movie.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Letterboxd
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />

                        <polyline points="15 3 21 3 21 9" />

                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </ExternalLink>
                  )}
                </InfoSection>
              </DetailContent>
            </DetailOverlay>
          )}
        </AnimatePresence>

        {!clickedBook && username && movies.length > 0 && !isLoading && (
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
