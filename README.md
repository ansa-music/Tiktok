# StudHelp — сайт приёма заявок на студенческие работы

Одностраничный сайт: студент выбирает тип работы, заполняет короткую форму и сразу попадает в WhatsApp с готовым текстом заявки. Владелец управляет ценами, номерами, текстами и FAQ через админ-панель `/admin` — без правки кода и пересборки.

**Стек:** Next.js 15 (App Router) + TypeScript, Tailwind CSS, Supabase (PostgreSQL), Vercel.

---

## Запуск за 5 шагов

### 1. База данных Supabase

1. Зарегистрируйтесь на [supabase.com](https://supabase.com) и создайте новый проект (бесплатный тариф подходит).
2. В меню слева откройте **SQL Editor** → **New query**.
3. Скопируйте содержимое файла [`supabase/schema.sql`](supabase/schema.sql), вставьте в редактор и нажмите **Run**.
   Создадутся таблицы `settings`, `whatsapp_numbers`, `services`, `faq` и стартовые данные (8 услуг, 4 вопроса FAQ, один номер-заглушка).

### 2. Ключи Supabase

В Supabase откройте **Settings → API** и скопируйте:

- **Project URL** — например `https://abcdefgh.supabase.co`;
- **service_role** key (раздел *Project API keys*, нажмите *Reveal*).

> `service_role` даёт полный доступ к базе. Он используется только на сервере и никогда не попадает в браузер. Не публикуйте его и не вставляйте в код.

### 3. Деплой на Vercel

1. Залейте этот репозиторий на GitHub.
2. На [vercel.com](https://vercel.com) нажмите **Add New → Project** и импортируйте репозиторий.
3. В разделе **Environment Variables** добавьте 4 переменные:

| Переменная | Значение |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL из шага 2 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key из шага 2 |
| `ADMIN_PASSWORD` | придумайте сложный пароль для входа в `/admin` |
| `SESSION_SECRET` | случайная строка **минимум 32 символа** (например, результат `openssl rand -hex 32`) |

   Необязательно: `NEXT_PUBLIC_SITE_URL` — публичный адрес сайта (`https://ваш-домен.kz`) для sitemap и Open Graph. Если не задан, берётся адрес Vercel.

4. Нажмите **Deploy**. Через пару минут сайт будет доступен по адресу вида `https://название.vercel.app`.

### 4. Настройка через админку

1. Откройте `https://ваш-сайт/admin` и введите `ADMIN_PASSWORD`.
2. Вкладка **WhatsApp номера** — замените номер-заглушку `77000000000` на свой (только цифры с кодом страны, например `77011234567`). Кнопка «Проверить» откроет чат и покажет, что номер рабочий. Здесь же выбирается режим: «Случайный менеджер» (заявки распределяются между всеми активными номерами) или «Всегда первый».
3. Вкладка **Цены и услуги** — поменяйте цены прямо в строке и нажмите «Сохранить». Выключенные услуги на сайте не показываются.
4. Вкладка **Тексты** — название сайта, заголовки главного экрана, шаблон сообщения в WhatsApp (с живым превью), ID Яндекс Метрики.
5. Вкладка **FAQ** — вопросы и ответы.

Изменения появляются на сайте сразу после сохранения (обновите страницу).

### 5. Свой домен

В Vercel: **Settings → Domains → Add**, введите домен и добавьте у регистратора DNS-записи, которые покажет Vercel. После этого укажите домен в переменной `NEXT_PUBLIC_SITE_URL` и сделайте Redeploy.

---

## Локальный запуск

```bash
npm install
cp .env.example .env.local   # заполните значения
npm run dev                  # http://localhost:3000
```

Если ключи Supabase не заданы, сайт и админка работают на встроенных моковых данных (хранятся в памяти, сбрасываются при перезапуске). Для входа в админку всё равно нужны `ADMIN_PASSWORD` и `SESSION_SECRET`.

Проверки перед деплоем:

```bash
npm run typecheck   # проверка типов
npm run build       # production-сборка
```

---

## Как это устроено

- **Форма → WhatsApp.** Номер выбирается в браузере в момент отправки; ссылка `https://wa.me/<номер>?text=...` открывается в новой вкладке (если Safari блокирует — в текущей). Строки шаблона с незаполненными полями в сообщение не попадают. Дата форматируется как ДД.ММ.ГГГГ.
- **Нет активных номеров** — кнопки отправки отключены, показывается «Приём заявок временно приостановлен».
- **Админка.** Вход по паролю (сравнение через `timingSafeEqual`), сессия — JWT в httpOnly cookie на 7 дней. После 5 неверных попыток с одного IP вход блокируется на 10 минут. Все `/admin/*` защищены в `middleware.ts`, каждый server action дополнительно вызывает `requireAdmin()`.
- **Данные.** Чтение и запись — только с сервера через service role. На таблицах включён RLS без публичных политик, поэтому anon-ключ к данным доступа не даёт.
- **Аналитика.** Если в админке задан ID Яндекс Метрики, подключается счётчик и отправляются цели `form_submit` (отправка формы) и `whatsapp_click` (любой клик по WhatsApp).
- **SEO.** Метаданные и Open Graph на русском, `sitemap.xml`, `robots.txt` (`/admin` закрыт от индексации), favicon.

## Структура проекта

```
app/
  layout.tsx            шрифт, метаданные, Яндекс Метрика
  page.tsx              публичный лендинг (revalidate = 60)
  robots.ts, sitemap.ts, icon.svg
  admin/
    login/page.tsx      форма входа
    page.tsx            дашборд с вкладками
    actions.ts          server actions: вход/выход, CRUD
components/public/      Hero, Services, OrderForm, HowItWorks, Guarantees, Faq, Footer, FloatingWhatsApp
components/admin/       AdminDashboard, ServicesTable, NumbersTable, SettingsForm, FaqTable, Toast
lib/
  supabase.ts           серверный клиент (service role)
  db.ts                 слой данных: Supabase или моковый стор
  data.ts               getSettings, getActiveServices, getActiveNumbers, getActiveFaq
  auth.ts               createSession, verifySession, requireAdmin
  whatsapp.ts           buildMessage, pickNumber, buildWaLink
middleware.ts           защита /admin/*
supabase/schema.sql     схема и стартовые данные
.env.example
```
