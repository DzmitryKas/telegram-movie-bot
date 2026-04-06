import type { Movie, KinopoiskMovieResponse, KinopoiskSearchResponse } from '../types/movie.js';

const BASE_URL = 'https://api.kinopoisk.dev/v1.4';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (process.env.KINOPOISK_API_KEY) {
    headers['X-API-KEY'] = process.env.KINOPOISK_API_KEY;
  }

  return headers;
}

/**
 * Поиск фильмов по названию
 */
export async function searchMovies(query: string): Promise<Movie[]> {
  const url = `${BASE_URL}/movie/search?query=${encodeURIComponent(query)}&page=1&limit=10`;

  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Kinopoisk API: неверный API ключ');
    }
    throw new Error(`Kinopoisk API: ошибка ${response.status}`);
  }

  const data: KinopoiskSearchResponse = await response.json() as KinopoiskSearchResponse;

  return data.docs?.map(mapKinopoiskToMovie) ?? [];
}

/**
 * Получить фильм по ID
 */
export async function getMovieById(id: number): Promise<Movie> {
  const url = `${BASE_URL}/movie/${id}`;

  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    throw new Error(`Kinopoisk API: ошибка ${response.status}`);
  }

  const data: KinopoiskMovieResponse = await response.json() as KinopoiskMovieResponse;
  return mapKinopoiskToMovie(data);
}

/**
 * Получить фильмы с фильтрами
 */
export async function getMoviesByFilters(options: {
  genreId?: number;
  minRating?: number;
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  limit?: number;
}): Promise<Movie[]> {
  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 10),
  });

  if (options.minRating) {
    params.append('rating.kp.gte', String(options.minRating));
  }
  if (options.yearFrom) {
    params.append('year.from', String(options.yearFrom));
  }
  if (options.yearTo) {
    params.append('year.to', String(options.yearTo));
  }

  const url = `${BASE_URL}/movie?${params.toString()}`;

  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    throw new Error(`Kinopoisk API: ошибка ${response.status}`);
  }

  const data: KinopoiskSearchResponse = await response.json() as KinopoiskSearchResponse;
  return data.docs?.map(mapKinopoiskToMovie) ?? [];
}

/**
 * Получить случайный фильм
 */
export async function getRandomMovie(): Promise<Movie> {
  const url = `${BASE_URL}/movie/random`;

  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    throw new Error(`Kinopoisk API: ошибка ${response.status}`);
  }

  const data: KinopoiskMovieResponse = await response.json() as KinopoiskMovieResponse;
  return mapKinopoiskToMovie(data);
}

/**
 * Маппинг ответа Kinopoisk в наш тип Movie
 */
function mapKinopoiskToMovie(data: KinopoiskMovieResponse): Movie {
  const year = data.year ?? 0;
  const rating = data.rating?.kp ?? data.rating?.imdb ?? 0;
  const genres = data.genres?.map((g: { name: string }) => g.name) ?? [];

  let description = data.description ?? '';
  if (!description && data.shortDescription) {
    description = data.shortDescription;
  }
  // Обрезаем до 300 символов
  if (description.length > 300) {
    description = description.slice(0, 300) + '...';
  }

  return {
    id: data.id,
    title: data.name ?? data.alternativeName ?? 'Без названия',
    year,
    overview: description || 'Описание отсутствует',
    posterUrl: data.poster?.url ?? '',
    rating,
    genres,
    runtime: data.movieLength ?? 0,
  };
}
