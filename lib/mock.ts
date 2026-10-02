import "server-only";
import type { Faq, Service, Settings, WhatsAppNumber } from "./types";

/**
 * Моковые данные — копия стартовых значений из supabase/schema.sql.
 * Используются, когда ключи Supabase не заданы, чтобы сайт и админка запускались локально.
 * Хранятся в памяти процесса: изменения из админки живут до перезапуска сервера.
 */

export const DEFAULT_TEMPLATE =
  "Здравствуйте! Хочу заказать работу.\nТип: {type}\nПредмет: {subject}\nТема: {topic}\nСрок сдачи: {deadline}\nОбъём: {volume}\nКомментарий: {comment}\nИмя: {name}";

interface MockStore {
  settings: Settings;
  numbers: WhatsAppNumber[];
  services: Service[];
  faq: Faq[];
}

function seed(): MockStore {
  return {
    settings: {
      id: 1,
      site_name: "StudHelp",
      hero_title: "Курсовые, дипломы и презентации — быстро и под требования вашего вуза",
      hero_subtitle: "Оставьте заявку — оценим стоимость за 15 минут в WhatsApp",
      message_template: DEFAULT_TEMPLATE,
      number_mode: "random",
      yandex_metrika_id: null,
      updated_at: new Date().toISOString(),
    },
    numbers: [{ id: "n-1", label: "Основной", phone: "77000000000", is_active: true, sort_order: 0 }],
    services: [
      ["Конспект", "Конспект лекции, главы или темы", 2000, "за работу", "от 1 дня", "NotebookPen"],
      ["Реферат", "С оформлением по ГОСТу и списком литературы", 5000, "за работу", "от 2 дней", "FileText"],
      ["Эссе", "Авторский текст по заданной теме", 4000, "за работу", "от 1 дня", "PenLine"],
      ["Презентация", "Дизайн + текст, PowerPoint или Google Slides", 500, "за слайд", "от 1 дня", "Presentation"],
      ["Курсовая работа", "Теория + практика, оформление по методичке", 25000, "за работу", "от 5 дней", "BookOpen"],
      ["Дипломная работа", "Полное сопровождение до защиты", 120000, "за работу", "от 14 дней", "GraduationCap"],
      ["Отчёт по практике", "Дневник, отчёт, характеристика", 15000, "за работу", "от 3 дней", "ClipboardList"],
      ["Решение задач", "Математика, экономика, программирование и др.", 1500, "за задачу", "от 1 дня", "Calculator"],
    ].map(([title, description, price_from, price_unit, deadline_text, icon], i) => ({
      id: `s-${i + 1}`,
      title: title as string,
      description: description as string,
      price_from: price_from as number,
      price_unit: price_unit as string,
      deadline_text: deadline_text as string,
      icon: icon as string,
      is_active: true,
      sort_order: i + 1,
    })),
    faq: [
      ["Как оплатить?", "Kaspi перевод. Предоплата 50%, остаток — после получения работы."],
      ["Будут ли правки?", "Да, бесплатные правки в течение срока гарантии."],
      ["Проходит ли антиплагиат?", "Да, проверяем перед сдачей и прикладываем отчёт."],
      ["Это конфиденциально?", "Да, ваши данные никому не передаются."],
    ].map(([question, answer], i) => ({
      id: `f-${i + 1}`,
      question,
      answer,
      is_active: true,
      sort_order: i + 1,
    })),
  };
}

// Храним в globalThis, чтобы стор переживал hot reload в dev-режиме.
const g = globalThis as unknown as { __studhelpMock?: MockStore };
export const mockStore: MockStore = g.__studhelpMock ?? (g.__studhelpMock = seed());

export function mockId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
