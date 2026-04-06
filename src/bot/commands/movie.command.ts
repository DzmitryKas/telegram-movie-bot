import { Composer } from 'grammy';
import type { MyContext } from '../../types/context.js';
import { getGenreKeyboard } from '../keyboards/genre.keyboard.js';

const composer = new Composer<MyContext>();

composer.command('movie', async (ctx) => {
  await ctx.reply(
    '🎬 *Давай подберём фильм!*\n\nВыбери жанр:',
    {
      parse_mode: 'Markdown',
      reply_markup: getGenreKeyboard(),
    },
  );
});

export default composer;
