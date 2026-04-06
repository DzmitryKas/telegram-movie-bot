export interface Movie {
  id: number;
  title: string;
  year: number;
  overview: string;
  posterUrl: string;
  rating: number;
  genres: string[];
  runtime: number;
}

// === TMDB Types ===
export interface TmdbMovieResponse {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids: number[];
  runtime?: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

// === Kinopoisk Types ===
export interface KinopoiskRating {
  kp?: number;
  imdb?: number;
  tmdb?: number;
}

export interface KinopoiskGenre {
  name: string;
}

export interface KinopoiskPoster {
  url: string;
  previewUrl?: string;
}

export interface KinopoiskMovieResponse {
  id: number;
  name?: string;
  alternativeName?: string;
  description?: string;
  shortDescription?: string;
  year?: number;
  rating?: KinopoiskRating;
  genres?: KinopoiskGenre[];
  poster?: KinopoiskPoster;
  movieLength?: number;
}

export interface KinopoiskSearchResponse {
  docs: KinopoiskMovieResponse[];
  total: number;
  page: number;
  pages: number;
}
