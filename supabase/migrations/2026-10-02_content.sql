-- Добавляет колонку с редактируемыми текстами секций.
-- Нужна только если schema.sql выполнялся до 02.10.2026. Выполнить в Supabase → SQL Editor.
alter table settings add column if not exists content jsonb not null default '{}'::jsonb;
