import { pgTable, serial, varchar, bigint, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';

// Пользователи
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  telegramId: bigint('telegram_id', { mode: 'number' }).notNull(),
  username: varchar('username', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  telegramIdIdx: uniqueIndex('users_telegram_id_idx').on(table.telegramId),
}));

// Предпочтения пользователей (лайк/дизлайк)
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  movieId: integer('movie_id').notNull(),
  movieTitle: varchar('movie_title', { length: 500 }),
  action: varchar('action', { length: 10 }).notNull(), // 'like' | 'dislike'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Просмотренные фильмы с оценкой
export const watchedMovies = pgTable('watched_movies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  movieId: integer('movie_id').notNull(),
  movieTitle: varchar('movie_title', { length: 500 }),
  rating: integer('rating'), // 1-10
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
