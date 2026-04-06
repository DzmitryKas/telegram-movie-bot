import { Composer } from 'grammy';
import type { MyContext } from '../../types/context.js';

const composer = new Composer<MyContext>();

composer.command('start', async (ctx) => {
  const username = ctx.from?.first_name ?? 'друг';

  await ctx.reply(
    `Привет, ${username}! 👋\n\n` +
    `Я помогу тебе найти идеальный фильм на вечер 🎬\n\n` +
    `Что я умею:\n` +
    `• Подберу фильм по жанру и настроению\n` +
    `• Учту, сколько у тебя времени\n` +
    `• Запомню твои предпочтения\n\n` +
    `Нажми кнопку ниже, чтобы начать 👇`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎬 Найти фильм', callback_data: 'find_movie' }],
        ],
      },
    },
  );
});

export default composer;
