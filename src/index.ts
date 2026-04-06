import { Bot } from 'grammy';
import { pino } from 'pino';
import dotenv from 'dotenv';
import { startCommand, helpCommand, movieCommand } from './bot/commands/index.js';
import { getMoodKeyboard, getDurationKeyboard, getMovieActionKeyboard } from './bot/keyboards/genre.keyboard.js';
import type { MyContext } from './types/context.js';

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

  // Пока — заглушка, позже здесь будет вызов TMDB
  await ctx.editMessageText(
    '🎬 *Ищу фильм для тебя...*\n\n' +
    `Жанр: \`${state.genre}\`\n` +
    `Настроение: \`${state.mood}\`\n` +
    `Длительность: \`${state.duration}\`\n\n` +
    '⚙️ TMDB API подключается на следующем этапе!\n' +
    'А пока попробуй /random или /help',
    {
      parse_mode: 'Markdown',
      reply_markup: getMovieActionKeyboard(),
    },
  );
});

// Обработка кнопки "Ещё вариант"
bot.callbackQuery('action_random', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    '🎲 *Новый фильм!*\n\n' +
    'Здесь будет случайный фильм с теми же фильтрами.\n' +
    '⚙️ Подключим на следующем этапе!',
    {
      parse_mode: 'Markdown',
      reply_markup: getMovieActionKeyboard(),
    },
  );
});

// Обработка лайк/дизлайк
bot.callbackQuery(/^action_(like|dislike)$/, async (ctx) => {
  const action = ctx.match[1];
  const emoji = action === 'like' ? '👍' : '👎';

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
      reply_markup: getMoodKeyboard(), // genre keyboard will be used
    },
  );
  // Redirect to /movie
  await ctx.reply('Используй /movie для начала подбора!');
});

// Обработка ошибок
bot.catch((err) => {
  logger.error(err, 'Bot error');
});

// Запуск
logger.info('🚀 Запуск бота...');
bot.start({
  onStart: (info) => {
    logger.info(`✅ Бот запущен! @${info.username}`);
  },
});
