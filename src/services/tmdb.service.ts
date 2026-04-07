import type { Movie, TmdbMovieResponse, TmdbGenre } from '../types/movie.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Маппинг жанров из Telegram в TMDB genre IDs
const TMDB_GENRE_MAP: Record<string, number> = {
  comedy: 35,        // Комедия
  drama: 18,         // Драма
  thriller: 53,      // Триллер
  horror: 27,        // Ужасы
  scifi: 878,        // Фантастика
  action: 28,        // Боевик
  animation: 16,     // Мультфильм
  documentary: 99,   // Документальный
};

function getTMDBHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (process.env.TMDB_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.TMDB_API_KEY}`;
  }

  return headers;
}

/**
 * Получить список всех жанров TMDB
 */
export async function getTMDBGenres(): Promise<TmdbGenre[]> {
  const url = `${TMDB_BASE_URL}/genre/movie/list?language=ru`;

  const response = await fetchWithRetry(url, { headers: getTMDBHeaders() });

  if (!response) {
    throw new Error('TMDB API: не удалось получить список жанров');
  }

  const data = await response.json() as { genres: TmdbGenre[] };
  return data.genres ?? [];
}

/**
 * Получить фильмы по фильтрам (жанр, рейтинг, год, длительность)
 */
export async function getMoviesByFilters(options: {
  genreId?: number;
  minRating?: number;
  yearFrom?: number;
  yearTo?: number;
  minRuntime?: number;
  maxRuntime?: number;
  excludeIds?: number[];
  page?: number;
  limit?: number;
}): Promise<Movie[]> {
  const params = new URLSearchParams({
    language: 'ru-RU',
    sort_by: 'popularity.desc',
    'vote_count.gte': '50', // Исключаем фильмы с малым количеством голосов
    page: String(options.page ?? 1),
  });

  if (options.genreId) {
    params.append('with_genres', String(options.genreId));
  }

  if (options.minRating) {
    params.append('vote_average.gte', String(options.minRating));
  }

  if (options.yearFrom) {
    params.append('primary_release_date.gte', `${options.yearFrom}-01-01`);
  }

  if (options.yearTo) {
    params.append('primary_release_date.lte', `${options.yearTo}-12-31`);
  }

  if (options.minRuntime) {
    params.append('with_runtime.gte', String(options.minRuntime));
  }

  if (options.maxRuntime) {
    params.append('with_runtime.lte', String(options.maxRuntime));
  }

  const url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
  const response = await fetchWithRetry(url, { headers: getTMDBHeaders() });

  if (!response) {
    throw new Error('TMDB API: не удалось получить список фильмов');
  }

  const data = await response.json() as { results: TmdbMovieResponse[] };
  let movies = data.results?.map(mapTMDBToMovie) ?? [];

  // Исключаем уже просмотренные фильмы
  if (options.excludeIds && options.excludeIds.length > 0) {
    movies = movies.filter((m) => !options.excludeIds!.includes(m.id));
  }

  return movies;
}

/**
 * Получить детали фильма по ID
 */
export async function getMovieDetails(id: number): Promise<Movie> {
  const url = `${TMDB_BASE_URL}/movie/${id}?language=ru-RU`;

  const response = await fetchWithRetry(url, { headers: getTMDBHeaders() });

  if (!response) {
    throw new Error('TMDB API: не удалось получить детали фильма');
  }

  if (response.status === 404) {
    throw new Error(`TMDB API: фильм с ID ${id} не найден`);
  }

  if (!response.ok) {
    throw new Error(`TMDB API: ошибка ${response.status}`);
  }

  const data = await response.json() as TmdbMovieResponse;
  return mapTMDBToMovie(data);
}

/**
 * Получить случайный фильм
 */
export async function getRandomMovie(): Promise<Movie> {
  // TMDB не имеет эндпоинта для случайного фильма, поэтому используем discover
  const movies = await getMoviesByFilters({ page: Math.floor(Math.random() * 10) + 1 });

  if (movies.length === 0) {
    throw new Error('TMDB API: не удалось получить случайный фильм');
  }

  return movies[Math.floor(Math.random() * movies.length)];
}

/**
 * Поиск фильма по названию
 */
export async function searchMovies(query: string, page = 1): Promise<Movie[]> {
  const params = new URLSearchParams({
    query,
    language: 'ru-RU',
    page: String(page),
  });

  const url = `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
  const response = await fetchWithRetry(url, { headers: getTMDBHeaders() });

  if (!response) {
    throw new Error('TMDB API: не удалось выполнить поиск');
  }

  const data = await response.json() as { results: TmdbMovieResponse[] };
  return data.results?.map(mapTMDBToMovie) ?? [];
}

/**
 * Получить URL постера
 */
export function getPosterUrl(posterPath: string | null): string {
  if (!posterPath) return '';
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}

/**
 * Получить жанры фильма по ID
 */
export async function getMovieGenres(movieId: number): Promise<string[]> {
  try {
    const movie = await getMovieDetails(movieId);
    return movie.genres;
  } catch {
    return [];
  }
}

/**
 * Маппинг ответа TMDB в наш тип Movie
 */
function mapTMDBToMovie(data: TmdbMovieResponse): Movie {
  const year = data.release_date ? parseInt(data.release_date.split('-')[0], 10) : 0;
  const rating = data.vote_average ?? 0;

  // TMDB возвращ genre_ids, но нам нужны названия жанров
  // Для полного списка жанров нужно делать отдельный запрос
  const genres = data.genre_ids?.slice(0, 3).map((id) => {
    const genreName = Object.entries(TMDB_GENRE_MAP).find(([, value]) => value === id)?.[0];
    return genreName ?? `genre_${id}`;
  }) ?? [];

  // Получаем overview (если пустой или на английском, пробуем получить русскую версию)
  let overview = data.overview || 'Описание отсутствует';

  return {
    id: data.id,
    title: data.title || 'Без названия',
    year,
    overview,
    posterUrl: getPosterUrl(data.poster_path),
    rating,
    genres,
    runtime: data.runtime ?? 0,
  };
}

/**
 * Fetch с retry логикой
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000,
): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      // Rate limit (429) - ждём дольше
      if (response.status === 429) {
        const waitTime = delay * Math.pow(2, i) * 2;
        console.warn(`TMDB API: rate limit, жду ${waitTime}мс перед повторной попыткой...`);
        await sleep(waitTime);
        continue;
      }

      // Ошибки сервера (500+) - пробуем снова
      if (response.status >= 500) {
        console.warn(`TMDB API: ошибка сервера ${response.status}, попытка ${i + 1}/${retries}`);
        await sleep(delay * Math.pow(2, i));
        continue;
      }

      return response;
    } catch (err) {
      console.warn(`TMDB API: ошибка сети, попытка ${i + 1}/${retries}:`, err);
      if (i === retries - 1) throw err;
      await sleep(delay * Math.pow(2, i));
    }
  }

  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
