import { Bot } from 'grammy';
import { pino } from 'pino';
import dotenv from 'dotenv';
import { startCommand, helpCommand, movieCommand } from './bot/commands/index.js';
import { getGenreKeyboard, getMoodKeyboard, getDurationKeyboard, getMovieActionKeyboard } from './bot/keyboards/genre.keyboard.js';
import type { MyContext } from './types/context.js';
import { getMovieByPreferences } from './services/recommendation.service.js';
import { formatMovieCard } from './utils/formatMovie.js';
import { getOrCreateUser, savePreference, getUserWatchedMovieIds } from './db/users.repository.js';

dotenv.config();

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

if (!process.env.BOT_TOKEN) {
  logger.error('BOT_TOKEN не установлен в .env');
  process.exit(1);
}

const bot = new Bot<MyContext>(process.env.BOT_TOKEN);

// Регистрируем команды
bot.use(startCommand);
bot.use(helpCommand);
bot.use(movieCommand);

// Middleware: сохраняем пользователя при каждом сообщении
bot.use(async (ctx, next) => {
  if (ctx.from) {
    try {
      await getOrCreateUser(ctx.from.id, ctx.from.username, ctx.from.first_name);
    } catch (err) {
      logger.warn(err, 'Не удалось сохранить пользователя');
    }
  }
  return next();
});

// Обработка callback от жанров
bot.callbackQuery(/^genre_(.+)/, async (ctx) => {
  const genre = ctx.match[1];
  const context = ctx as MyContext;
  context.movieSearchState = { genre };

  await ctx.answerCallbackQuery();
  await ctx.editMessageText('Отлично! Теперь выбери настроение:', {
    reply_markup: getMoodKeyboard(),
  });
});

// Обработка callback от настроения
bot.callbackQuery(/^mood_(.+)/, async (ctx) => {
  const mood = ctx.match[1];
  const state = (ctx as MyContext).movieSearchState ?? {};
  state.mood = mood;
  (ctx as MyContext).movieSearchState = state;

  await ctx.answerCallbackQuery();
  await ctx.editMessageText('Последний шаг — сколько у тебя времени?', {
    reply_markup: getDurationKeyboard(),
  });
});

// Обработка callback от длительности
bot.callbackQuery(/^duration_(.+)/, async (ctx) => {
  const duration = ctx.match[1];
  const state = (ctx as MyContext).movieSearchState ?? {};
  state.duration = duration;
  (ctx as MyContext).movieSearchState = state;

  await ctx.answerCallbackQuery();

  try {
    await ctx.editMessageText('🔍 *Ищу фильм для тебя...*', { parse_mode: 'Markdown' });

    // Получаем ID уже просмотренных фильмов, чтобы не повторяться
    const watchedIds = ctx.from ? await getUserWatchedMovieIds(ctx.from.id) : [];

    const movie = await getMovieByPreferences({
      genre: state.genre,
      mood: state.mood,
      duration: state.duration,
      excludeIds: watchedIds,
    });

    // Сохраняем информацию о фильме в состоянии для последующего лайк/дизлайк
    state.lastMovieId = movie.id;
    state.lastMovieTitle = movie.title;
    (ctx as MyContext).movieSearchState = state;

    const card = formatMovieCard(movie);

    // Отправляем постер с подписью
    if (movie.posterUrl) {
      await ctx.editMessageMedia({
        type: 'photo',
        media: movie.posterUrl,
        caption: card,
        parse_mode: 'Markdown',
      }, {
        reply_markup: getMovieActionKeyboard(),
      });
    } else {
      // Если нет постера — просто текст
      await ctx.editMessageText(card, {
        parse_mode: 'Markdown',
        reply_markup: getMovieActionKeyboard(),
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
    logger.error(err, 'Ошибка при поиске фильма');
    await ctx.editMessageText(
      `😔 Не удалось найти фильм: ${message}\n\nПопробуй ещё раз!`,
      { reply_markup: getMovieActionKeyboard() },
    );
  }
});

// Обработка кнопки "Ещё вариант"
bot.callbackQuery('action_random', async (ctx) => {
  await ctx.answerCallbackQuery();

  try {
    const state = (ctx as MyContext).movieSearchState;

    if (!state || !state.genre) {
      await ctx.editMessageText(
        '🎲 *Новый фильм!*\n\n' +
        'Выбери жанр сначала через /movie',
        { parse_mode: 'Markdown' },
      );
      return;
    }

    await ctx.editMessageText('🔍 *Ищу новый фильм...*', { parse_mode: 'Markdown' });

    // Получаем ID уже просмотренных фильмов
    const watchedIds = ctx.from ? await getUserWatchedMovieIds(ctx.from.id) : [];

    const movie = await getMovieByPreferences({
      genre: state.genre,
      mood: state.mood,
      duration: state.duration,
      excludeIds: watchedIds,
    });

    // Сохраняем информацию о фильме в состоянии
    state.lastMovieId = movie.id;
    state.lastMovieTitle = movie.title;
    (ctx as MyContext).movieSearchState = state;

    const card = formatMovieCard(movie);

    // Отправляем постер с подписью
    if (movie.posterUrl) {
      await ctx.editMessageMedia({
        type: 'photo',
        media: movie.posterUrl,
        caption: card,
        parse_mode: 'Markdown',
      }, {
        reply_markup: getMovieActionKeyboard(),
      });
    } else {
      await ctx.editMessageText(card, {
        parse_mode: 'Markdown',
        reply_markup: getMovieActionKeyboard(),
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
    logger.error(err, 'Ошибка при поиске фильма');
    await ctx.editMessageText(
      `😔 Не удалось найти фильм: ${message}\n\nПопробуй ещё раз!`,
      { reply_markup: getMovieActionKeyboard() },
    );
  }
});

// Обработка лайк/дизлайк
bot.callbackQuery(/^action_(like|dislike)$/, async (ctx) => {
  const action = ctx.match[1] as 'like' | 'dislike';
  const emoji = action === 'like' ? '👍' : '👎';

  try {
    const user = await getOrCreateUser(ctx.from!.id, ctx.from!.username, ctx.from!.first_name);

    // Получаем movieId из состояния
    const state = (ctx as MyContext).movieSearchState;
    const movieId = state?.lastMovieId ?? 0;
    const movieTitle = state?.lastMovieTitle ?? 'unknown';

    await savePreference(user.id, movieId, movieTitle, action);
  } catch (err) {
    logger.warn(err, 'Не удалось сохранить предпочтение');
  }

  await ctx.answerCallbackQuery(`${emoji} Сохранено!`);
  await ctx.editMessageText(
    `${emoji} Отмечено! Скоро здесь будет история твоих предпочтений.`,
    {
      reply_markup: getMovieActionKeyboard(),
    },
  );
});

// Обработка кнопки "Найти фильм" из /start
bot.callbackQuery('find_movie', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '🎬 *Давай подберём фильм!*\n\nВыбери жанр:',
    {
      parse_mode: 'Markdown',
      reply_markup: getGenreKeyboard(),
    },
  );
});

// Обработка кнопки "Назад" к выбору жанра
bot.callbackQuery('back_to_genre', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText('Выбери жанр:', {
    reply_markup: getGenreKeyboard(),
  });
});

// Обработка кнопки "Назад" к выбору настроения
bot.callbackQuery('back_to_mood', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText('Отлично! Теперь выбери настроение:', {
    reply_markup: getMoodKeyboard(),
  });
});

// Обработка ошибок
bot.catch((err) => {
  logger.error(err, 'Bot error');
});

// Запуск
logger.info('🚀 Запуск бота...');

let botRunning = true;

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Получен SIGINT, завершаю работу...');
  botRunning = false;
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Получен SIGTERM, завершаю работу...');
  botRunning = false;
  await bot.stop();
  process.exit(0);
});

bot.start({
  onStart: (info) => {
    logger.info(`✅ Бот запущен! @${info.username}`);
  },
});
