# BlitzMall — Team2Admin (деплой-репозиторій)

Цей репозиторій містить **повний стек** (backend + frontend) для розгортання BlitzMall на
сервері. Призначений для адмінів команди, щоб розгорнути проєкт без додаткового налаштування.

## Структура

- `backend/BlitzMall_Backend` — ASP.NET Core 8 + PostgreSQL (Npgsql) + Firebase Auth
- `frontend` — React + TypeScript + Vite

## Швидкий старт (локально)

### 1. База даних

Потрібен PostgreSQL. За замовчуванням `appsettings.json` вказує на:

```
Host=localhost;Port=5432;Database=blitzmall;Username=blitz;Password=blitz123
```

Створи базу/користувача з цими даними (або зміни рядок підключення у
`backend/BlitzMall_Backend/appsettings.json` під свій сервер — **деплой передбачається саме на
PostgreSQL**, інший провайдер БД не підтримується).

```bash
createuser blitz -P   # пароль: blitz123
createdb blitzmall -O blitz
```

### 2. Бекенд

```bash
cd backend/BlitzMall_Backend
dotnet restore
dotnet ef database update   # застосує міграції
dotnet run --urls "http://localhost:5154"
```

**Firebase service account**: файл `firebase-service-account.json` **свідомо не в репозиторії**
— GitHub блокує пуші з реальними Google Service Account ключами (push protection), і це
правильно: витік такого ключа дає повний доступ до нашого Firebase-проєкту. Ключ переданий
окремо (поза git) — поклади його в `backend/BlitzMall_Backend/firebase-service-account.json`
перед запуском. Шлях до нього береться з `appsettings.json` → `Firebase.ServiceAccountPath`.

### 3. Фронтенд

```bash
cd frontend
npm install
npm run dev -- --port 5175
```

`.env` з конфігом Firebase (Web API key тощо) вже в репозиторії — нічого донастроювати не
потрібно. Якщо бекенд піднятий на іншому хості/порту — зміни `VITE_API_URL` у `.env`.

## Тестові акаунти

Створені наживо у Firebase + базі, готові до використання прямо зараз:

| Роль | Email | Пароль |
|---|---|---|
| Admin | `admin.demo@blitzmall.test` | `BlitzDemo2026!` |
| Seller (магазин "Demo Shop") | `seller.demo@blitzmall.test` | `BlitzDemo2026!` |
| Buyer | `buyer.demo@blitzmall.test` | `BlitzDemo2026!` |

Вхід — через кнопку email/пароль на `/login` (Firebase email/password провайдер). Реєстрація
нових акаунтів теж працює одразу — email/пароль, Google-попап і відновлення пароля через
email вже перевірені вживу.

## Відомі обмеження / що варто знати

- **Google-вхід**: кнопка працює локально (Firebase Google-провайдер підключений коректно,
  попап відкривається). Якщо після деплою на реальний домен Google-вхід не працюватиме —
  потрібно додати цей домен у Firebase Console → Authentication → Settings →
  **Authorized domains** (за замовчуванням там лише localhost і `*.firebaseapp.com`).
- **Відновлення пароля по телефону** (SMS) використовує Firebase Phone Auth — працює, але
  реальна доставка SMS залежить від квоти/налаштувань Firebase-проєкту.
- Бекенд має невикористаний legacy-ендпоінт `/api/auth/google` (пряма перевірка Google ID
  Token через `Google:ClientId` в `appsettings.json`) — фронтенд його **не використовує**
  (реальний Google-вхід йде через Firebase popup → `/api/auth/firebase-login`). Значення
  `Google:ClientId: "YOUR_GOOGLE_CLIENT_ID"` можна ігнорувати або видалити.
- Деякі сторінки адмін- і seller-кабінетів (реклама/банери, спори, безпека, інтеграції,
  CRM-підписки, збережені картки) працюють у демо-режимі (дані локальні/ілюстративні), бо на
  бекенді ще немає відповідних сутностей у базі — це позначено прямо на сторінках.

## CORS

Бекенд дозволяє запити з `localhost:5173/5174/5175`, а також з `*.ngrok-free.app` і
`*.trycloudflare.com` (для тестування через тунель). Для продового домену додай його в
`Program.cs` → `AddCors` → `WithOrigins`.
