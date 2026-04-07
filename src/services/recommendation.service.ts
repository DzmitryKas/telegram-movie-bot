import { getRandomMovie, getMoviesByFilters } from './tmdb.service.js';
import type { Movie } from '../types/movie.js';

// Маппинг жанров из Telegram в TMDB genre IDs
const GENRE_MAP: Record<string, { genreId?: number; yearFrom?: number; minRating?: number }> = {
  comedy: { genreId: 35, minRating: 5 },       // Комедия
  horror: { genreId: 27, minRating: 4 },       // Ужасы
  thriller: { genreId: 53, minRating: 5 },     // Триллер
  action: { genreId: 28, minRating: 5 },       // Боевик
  scifi: { genreId: 878, minRating: 5 },       // Фантастика
  drama: { genreId: 18, minRating: 6 },        // Драма
  animation: { genreId: 16, minRating: 5 },    // Мультфильм
  documentary: { genreId: 99, minRating: 5 },  // Документальный
};

const MOOD_MAP: Record<string, Partial<{ minRating: number; yearFrom: number }>> = {
  light: { minRating: 6 },
  serious: { minRating: 7 },
  thrilling: { minRating: 5 },
  touching: { minRating: 6 },
};

const DURATION_MAP: Record<string, { minRuntime?: number; maxRuntime?: number }> = {
  short: { maxRuntime: 90 },
  medium: { minRuntime: 90, maxRuntime: 120 },
  long: { minRuntime: 120 },
  any: {},
};

/**
 * Получить фильм по фильтрам пользователя
 */
export async function getMovieByPreferences(options: {
  genre?: string;
  mood?: string;
  duration?: string;
  excludeIds?: number[];
}): Promise<Movie> {
  const genreConfig = options.genre ? GENRE_MAP[options.genre] : {};
  const moodConfig = options.mood ? MOOD_MAP[options.mood] : {};
  const durationConfig = options.duration ? DURATION_MAP[options.duration] : {};

  // Если нет фильтров — случайный фильм
  if (!genreConfig.genreId && !moodConfig.minRating && !durationConfig.minRuntime && !durationConfig.maxRuntime) {
    return getRandomMovie();
  }

  const movies = await getMoviesByFilters({
    genreId: genreConfig.genreId,
    minRating: Math.max(moodConfig.minRating ?? 0, genreConfig.minRating ?? 0) || undefined,
    yearFrom: genreConfig.yearFrom,
    minRuntime: durationConfig.minRuntime,
    maxRuntime: durationConfig.maxRuntime,
    excludeIds: options.excludeIds,
    limit: 20,
  });

  if (movies.length === 0) {
    // Fallback — случайный фильм
    return getRandomMovie();
  }

  // Возвращаем случайный из отфильтрованных
  return movies[Math.floor(Math.random() * movies.length)];
}
