import { Composer } from 'grammy';
import type { MyContext } from '../../types/context.js';

const composer = new Composer<MyContext>();

composer.command('help', async (ctx) => {
  await ctx.reply(
    `📋 *Доступные команды:*\n\n` +
    `/start — Запустить бота\n` +
    `/movie — Найти фильм на вечер\n` +
    `/random — Случайный фильм\n` +
    `/top — Топ фильмов за неделю\n` +
    `/profile — Моя статистика\n` +
    `/help — Эта справка\n\n` +
    `💡 *Совет:* Нажми кнопку «🎬 Найти фильм» для быстрого старта!`,
    {
      parse_mode: 'Markdown',
    },
  );
});

export default composer;
