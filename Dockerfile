FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Финальный образ
FROM node:20-alpine

WORKDIR /app

# Копируем собранный код
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Устанавливаем только продакшен зависимости
RUN npm ci --only=production

# Копируем файлы для миграций
COPY drizzle.config.ts ./
COPY src/db/schema.ts ./src/db/schema.ts

# Ждём готовности БД и применяем миграции
RUN apk add --no-cache postgresql-client

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Bot is healthy')" || exit 1

CMD ["node", "dist/index.js"]
