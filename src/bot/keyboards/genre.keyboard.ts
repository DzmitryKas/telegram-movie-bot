import { InlineKeyboard } from 'grammy';

export function getGenreKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('😄 Комедия', 'genre_comedy')
    .text('😱 Ужасы', 'genre_horror')
    .row()
    .text('🔥 Триллер', 'genre_thriller')
    .text('💥 Боевик', 'genre_action')
    .row()
    .text('🚀 Фантастика', 'genre_scifi')
    .text('😢 Драма', 'genre_drama')
    .row()
    .text('🎨 Мультфильм', 'genre_animation')
    .text('📹 Документальный', 'genre_documentary');
}

export function getMoodKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('😊 Лёгкий', 'mood_light')
    .text('🤔 Серьёзный', 'mood_serious')
    .row()
    .text('🔥 Захватывающий', 'mood_thrilling')
    .text('😢 Трогательный', 'mood_touching');
}

export function getDurationKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('⏱ До 90 мин', 'duration_short')
    .text('⏱ 90-120 мин', 'duration_medium')
    .row()
    .text('⏱ 120+ мин', 'duration_long')
    .text('⏱ Не важно', 'duration_any');
}

export function getMovieActionKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('👍 Нравится', 'action_like')
    .text('👎 Не то', 'action_dislike')
    .row()
    .text('🎲 Ещё вариант', 'action_random');
}
