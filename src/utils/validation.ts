import { z } from 'zod';

// Валидация параметров поиска фильма
export const MovieSearchSchema = z.object({
  genre: z.enum([
    'comedy',
    'horror',
    'thriller',
    'action',
    'scifi',
    'drama',
    'animation',
    'documentary',
  ]).optional(),
  mood: z.enum([
    'light',
    'serious',
    'thrilling',
    'touching',
  ]).optional(),
  duration: z.enum([
    'short',
    'medium',
    'long',
    'any',
  ]).optional(),
});

// Валидация действия пользователя (лайк/дизлайк)
export const UserActionSchema = z.enum(['like', 'dislike']);

// Валидация настроек бота
export const BotConfigSchema = z.object({
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN обязателен'),
  TMDB_API_KEY: z.string().min(1, 'TMDB_API_KEY обязателен'),
  DATABASE_URL: z.string().url('DATABASE_URL должен быть валидным URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Валидация ответа от TMDB API
export const TmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  release_date: z.string().optional(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  vote_average: z.number(),
  genre_ids: z.array(z.number()).optional(),
  runtime: z.number().optional(),
});

// Валидация пользователя
export const UserSchema = z.object({
  telegramId: z.number().int().positive(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
});

// Типы из схем
export type MovieSearchInput = z.infer<typeof MovieSearchSchema>;
export type UserAction = z.infer<typeof UserActionSchema>;
export type BotConfig = z.infer<typeof BotConfigSchema>;
