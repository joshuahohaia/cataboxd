export interface Movie {
  id: string;
  filmTitle: string;
  filmYear: number;
  memberRating: number;
  posterUrl: string;
  review: string;
  watchedDate: string;
  link: string;
  isRewatch: boolean;
  isLiked: boolean;
}

export interface AppState {
  movies: Movie[];
  selectedMovieId: string | null;
  isLoading: boolean;
  error: string | null;
}
