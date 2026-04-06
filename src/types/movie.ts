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
