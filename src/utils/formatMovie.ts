import type { Movie } from '../types/movie.js';

/**
 * Форматирование фильма в красивое сообщение для Telegram
 */
export function formatMovieCard(movie: Movie): string {
  const genres = movie.genres.slice(0, 3).join(', ');
  const rating = movie.rating > 0 ? `⭐ ${movie.rating.toFixed(1)}` : '❓ Без рейтинга';
  const runtime = movie.runtime > 0 ? `⏱ ${movie.runtime} мин` : '';
  const header = `*${movie.title}* (${movie.year})`;

  let text = `${header}\n\n`;
  text += `${rating}`;
  if (runtime) text += ` • ${runtime}`;
  if (genres) text += `\n🎭 ${genres}`;

  text += `\n\n${movie.overview}`;

  return text;
}

/**
 * Форматирование короткой карточки (для списка)
 */
export function formatMovieShort(movie: Movie): string {
  const rating = movie.rating > 0 ? `⭐ ${movie.rating.toFixed(1)}` : '';
  return `${movie.title} (${movie.year}) ${rating}`.trim();
}
