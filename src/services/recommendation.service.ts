import { getRandomMovie, getMoviesByFilters } from '../services/kinopoisk.service.js';
import type { Movie } from '../types/movie.js';

// Маппинг жанров из Telegram в Kinopoisk
const GENRE_MAP: Record<string, { genreId?: number; yearFrom?: number; minRating?: number }> = {
  comedy: { genreId: 1, minRating: 5 },       // Комедия
  horror: { genreId: 9, minRating: 4 },       // Ужасы
  thriller: { genreId: 4, minRating: 5 },     // Триллер
  action: { genreId: 3, minRating: 5 },       // Боевик
  scifi: { genreId: 15, minRating: 5 },       // Фантастика
  drama: { genreId: 5, minRating: 6 },        // Драма
  animation: { genreId: 10, minRating: 5 },   // Мультфильм
  documentary: { genreId: 12, minRating: 5 }, // Документальный
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
    limit: 20,
  });

  if (movies.length === 0) {
    // Fallback — случайный фильм
    return getRandomMovie();
  }

  // Фильтрация по длительности (если есть данные)
  let filtered = movies;
  if (durationConfig.minRuntime || durationConfig.maxRuntime) {
    filtered = movies.filter((m) => {
      if (durationConfig.minRuntime && m.runtime < durationConfig.minRuntime) return false;
      if (durationConfig.maxRuntime && m.runtime > durationConfig.maxRuntime) return false;
      return true;
    });
  }

  if (filtered.length === 0) {
    filtered = movies; // Если ничего не подошло — берём всё
  }

  // Возвращаем случайный из отфильтрованных
  return filtered[Math.floor(Math.random() * filtered.length)];
}
