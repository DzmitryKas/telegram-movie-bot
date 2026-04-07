# 🎬 Telegram Bot «Фильм на вечер»

Telegram-бот для быстрого подбора фильмов на вечер. Поможет выбрать фильм по вашим предпочтениям: жанр, настроение и количество свободного времени.

## ✨ Возможности

- **🎭 Выбор жанра** — комедия, ужасы, триллер, боевик, фантастика, драма, мультфильм, документальный
- **😊 Выбор настроения** — лёгкий, серьёзный, захватывающий, троггательный
- **⏱ Учёт времени** — до 90 мин, 90-120 мин, 120+ мин или не важно
- **👍 Лайк/дизлайк** — сохраняйте понравившиеся фильмы
- **🎲 Случайный фильм** — если не можете определиться
- **📊 История просмотров** — отслеживайте, что уже смотрели
- **🖼 Постеры фильмов** — красивые карточки с информацией о фильме

## 🛠 Технологии

| Компонент | Технология |
|-----------|------------|
| Runtime | Node.js 20+ |
| Язык | TypeScript |
| Бот-фреймворк | grammY |
| База данных | PostgreSQL |
| ORM | Drizzle ORM |
| Внешний API | TMDB (The Movie Database) |
| Валидация | Zod |
| Логирование | pino |

## 📋 Предварительные требования

- Node.js 20+
- PostgreSQL 14+
- TMDB API Key (получить на [themoviedb.org](https://www.themoviedb.org/settings/api))
- Telegram Bot Token (получить у [@BotFather](https://t.me/BotFather))

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/DzmitryKas/telegram-movie-bot.git
cd telegram-movie-bot
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и заполните необходимые данные:

```bash
cp .env.example .env
```

Откройте `.env` и укажите:

```env
# Telegram Bot
BOT_TOKEN=your-telegram-bot-token

# TMDB API
TMDB_API_KEY=your-tmdb-api-key

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/movie_bot

# Node
NODE_ENV=development
```

### 4. Создание базы данных

```bash
# Применить миграции
npm run db:push

# Или открыть Drizzle Studio для управления БД
npm run db:studio
```

### 5. Запуск бота

```bash
# Режим разработки (с автоматическим перезапуском)
npm run dev

# Продакшен сборка
npm run build
npm start
```

## 🐳 Запуск через Docker Compose

Для удобного развёртывания бота вместе с PostgreSQL:

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL в контейнере
- Применит миграции к базе данных
- Запустит бота

## 📁 Структура проекта

```
src/
├── bot/
│   ├── commands/        # Обработчики команд (/start, /movie, /help)
│   ├── keyboards/       # Inline клавиатуры
│   └── scenes/          # Сценарии диалогов
├── db/
│   ├── schema.ts        # Схема базы данных (Drizzle ORM)
│   ├── db.ts            # Подключение к БД
│   └── users.repository.ts  # Репозиторий пользователей
├── services/
│   ├── tmdb.service.ts       # TMDB API клиент
│   └── recommendation.service.ts  # Логика рекомендаций
├── types/
│   ├── context.ts       # Типы контекста бота
│   └── movie.ts         # Типы фильмов
├── utils/
│   ├── formatMovie.ts   # Форматирование карточки фильма
│   └── validation.ts    # Zod валидация
├── middleware/           # Промежуточные обработчики
└── index.ts             # Точка входа
```

## 🎮 Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Приветствие и кнопка «Найти фильм» |
| `/movie` | Начать подбор фильма (жанр → настроение → длительность) |
| `/help` | Список доступных команд |

## 🗃 База данных

### Таблицы

- **users** — пользователи Telegram
- **user_preferences** — лайки/дизлайки фильмов
- **watched_movies** — история просмотренных фильмов

Миграции управляются через Drizzle Kit:

```bash
# Создать новую миграцию
npm run db:generate

# Применить миграции
npm run db:migrate

# Открыть GUI для БД
npm run db:studio
```

## 🔧 Скрипты

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Продакшен сборка
npm start            # Запуск продакшен версии
npm run lint         # Проверка линтером
npm run db:generate  # Генерация миграций
npm run db:migrate   # Применение миграций
npm run db:push      # Push схемы в БД
npm run db:studio    # Открыть Drizzle Studio
```

## 📝 Получение API ключей

### Telegram Bot Token

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный токен

### TMDB API Key

1. Зарегистрируйтесь на [themoviedb.org](https://www.themoviedb.org/signup)
2. Перейдите в [настройки аккаунта](https://www.themoviedb.org/settings/api)
3. Создайте новый API ключ (Bearer Token)
4. Скопируйте ключ

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT

## 👤 Автор

**Dzmitry Kas**

- GitHub: [DzmitryKas](https://github.com/DzmitryKas)

## 🙏 Благодарности

- [TMDB](https://www.themoviedb.org/) — база данных фильмов
- [grammY](https://grammy.dev/) — фреймворк для Telegram ботов
- [Drizzle ORM](https://orm.drizzle.team/) — TypeScript ORM
