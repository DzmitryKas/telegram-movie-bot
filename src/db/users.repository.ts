import { eq, and } from 'drizzle-orm';
import { db } from './db.js';
import { users, userPreferences, watchedMovies } from './schema.js';

/**
 * Создать или получить пользователя по Telegram ID
 */
export async function getOrCreateUser(telegramId: number, username?: string, firstName?: string) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [newUser] = await db
    .insert(users)
    .values({
      telegramId,
      username: username ?? null,
      firstName: firstName ?? null,
    })
    .returning();

  return newUser;
}

/**
 * Сохранить предпочтение (лайк/дизлайк)
 */
export async function savePreference(userId: number, movieId: number, movieTitle: string, action: 'like' | 'dislike') {
  await db.insert(userPreferences).values({
    userId,
    movieId,
    movieTitle,
    action,
  });
}

/**
 * Сохранить просмотренный фильм
 */
export async function saveWatchedMovie(userId: number, movieId: number, movieTitle: string, rating?: number) {
  await db.insert(watchedMovies).values({
    userId,
    movieId,
    movieTitle,
    rating: rating ?? null,
  });
}

/**
 * Получить историю лайков пользователя
 */
export async function getUserLikedMovies(userId: number) {
  return db
    .select()
    .from(userPreferences)
    .where(
      and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.action, 'like'),
      ),
    );
}

/**
 * Получить список просмотренных фильмов (ID)
 */
export async function getUserWatchedMovieIds(userId: number): Promise<number[]> {
  const rows = await db
    .select({ movieId: watchedMovies.movieId })
    .from(watchedMovies)
    .where(eq(watchedMovies.userId, userId));

  return rows.map((r) => r.movieId);
}

/**
 * Получить статистику пользователя
 */
export async function getUserStats(userId: number) {
  const liked = await db
    .select()
    .from(userPreferences)
    .where(
      and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.action, 'like'),
      ),
    );

  const watched = await db
    .select()
    .from(watchedMovies)
    .where(eq(watchedMovies.userId, userId));

  return {
    likedCount: liked.length,
    watchedCount: watched.length,
    avgRating: watched.length > 0
      ? watched.reduce((sum, w) => sum + (w.rating ?? 0), 0) / watched.length
      : null,
  };
}
