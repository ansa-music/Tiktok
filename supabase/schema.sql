-- Схема базы данных StudHelp. Выполнить один раз в Supabase → SQL Editor → Run.

-- Общие настройки сайта (всегда одна строка, id = 1)
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'StudHelp',
  hero_title text not null default 'Курсовые, дипломы и презентации — быстро и под требования вашего вуза',
  hero_subtitle text not null default 'Оставьте заявку — оценим стоимость за 15 минут в WhatsApp',
  message_template text not null default
    E'Здравствуйте! Хочу заказать работу.\nТип: {type}\nПредмет: {subject}\nТема: {topic}\nСрок сдачи: {deadline}\nОбъём: {volume}\nКомментарий: {comment}\nИмя: {name}',
  number_mode text not null default 'random' check (number_mode in ('random','first')),
  yandex_metrika_id text,
  updated_at timestamptz default now()
);
insert into settings (id) values (1) on conflict do nothing;

-- Номера WhatsApp
create table if not exists whatsapp_numbers (
  id uuid primary key default gen_random_uuid(),
  label text not null,               -- например «Менеджер Айгерим»
  phone text not null,               -- только цифры, формат 77XXXXXXXXX
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- Услуги и цены
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_from int not null,           -- в тенге
  price_unit text default '',        -- например «за работу», «за слайд», «за страницу»
  deadline_text text default '',     -- например «от 1 дня»
  icon text default 'FileText',      -- имя иконки lucide-react
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- FAQ
create table if not exists faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- RLS: включено, публичного доступа нет. Всё чтение и запись — только с сервера через service role.
alter table settings enable row level security;
alter table whatsapp_numbers enable row level security;
alter table services enable row level security;
alter table faq enable row level security;

-- Стартовые данные
insert into whatsapp_numbers (label, phone, sort_order) values
  ('Основной', '77000000000', 0);

insert into services (title, description, price_from, price_unit, deadline_text, icon, sort_order) values
  ('Конспект',            'Конспект лекции, главы или темы',            2000,  'за работу', 'от 1 дня',   'NotebookPen',   1),
  ('Реферат',             'С оформлением по ГОСТу и списком литературы', 5000,  'за работу', 'от 2 дней',  'FileText',      2),
  ('Эссе',                'Авторский текст по заданной теме',           4000,  'за работу', 'от 1 дня',   'PenLine',       3),
  ('Презентация',         'Дизайн + текст, PowerPoint или Google Slides', 500, 'за слайд',  'от 1 дня',   'Presentation',  4),
  ('Курсовая работа',     'Теория + практика, оформление по методичке',  25000, 'за работу', 'от 5 дней',  'BookOpen',      5),
  ('Дипломная работа',    'Полное сопровождение до защиты',             120000,'за работу', 'от 14 дней', 'GraduationCap', 6),
  ('Отчёт по практике',   'Дневник, отчёт, характеристика',             15000, 'за работу', 'от 3 дней',  'ClipboardList', 7),
  ('Решение задач',       'Математика, экономика, программирование и др.', 1500, 'за задачу', 'от 1 дня', 'Calculator',    8);

insert into faq (question, answer, sort_order) values
  ('Как оплатить?', 'Kaspi перевод. Предоплата 50%, остаток — после получения работы.', 1),
  ('Будут ли правки?', 'Да, бесплатные правки в течение срока гарантии.', 2),
  ('Проходит ли антиплагиат?', 'Да, проверяем перед сдачей и прикладываем отчёт.', 3),
  ('Это конфиденциально?', 'Да, ваши данные никому не передаются.', 4);
