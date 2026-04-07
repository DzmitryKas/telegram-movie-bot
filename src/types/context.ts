import type { Context } from 'grammy';

export interface MovieSearchState {
  genre?: string;
  mood?: string;
  duration?: string;
  lastMovieId?: number;
  lastMovieTitle?: string;
}

export interface MyContext extends Context {
  movieSearchState?: MovieSearchState;
}
