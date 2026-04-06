import { Bot } from 'grammy';
import { pino } from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const bot = new Bot(process.env.BOT_TOKEN ?? '');

bot.command('start', (ctx) => ctx.reply('Бот запущен!'));
bot.command('help', (ctx) => ctx.reply('Используйте /movie для поиска фильма'));

logger.info('Starting bot...');
bot.start();
