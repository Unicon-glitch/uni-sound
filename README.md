# Uni Sound

Музыкальная платформа экосистемы Unicon Music. Репозиторий содержит приложение Next.js и SQL-миграции Supabase.

## Технологии

- Next.js 15 + React 19
- TypeScript
- Supabase (PostgreSQL, Auth, Storage)
- CSS Modules / глобальная дизайн-система

## Локальный запуск

Требуется Node.js 20.9 или новее.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Заполни `.env.local` значениями из Supabase → Project Settings → API:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (или publishable key)

Не добавляй service-role key в клиентский код, Git или переменные с префиксом `NEXT_PUBLIC_`.

## Supabase

SQL-миграции находятся в `supabase/migrations`. Применяй их через Supabase SQL Editor или Supabase CLI после проверки содержимого.

## Статус

Начальный каркас интерфейса и проекта. Каталог, авторизация, аудиоплеер, библиотека и админские операции будут подключаться отдельными проверяемыми модулями. Не считать отключённые элементы интерфейса реализованными функциями.

## Развёртывание

Рекомендуемый вариант — Vercel с подключённым GitHub-репозиторием. Добавь те же переменные окружения в настройках проекта Vercel.
