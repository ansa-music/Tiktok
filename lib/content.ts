/**
 * Редактируемый контент секций сайта. Хранится в settings.content (jsonb).
 * Любое отсутствующее поле подставляется из DEFAULT_CONTENT, поэтому можно безопасно
 * добавлять новые ключи, не трогая существующие записи в БД.
 */

export interface Step { title: string; text: string }
export interface Item { title: string; text: string }

export interface SiteContent {
  hero: {
    badge: string;
    cta_primary: string;
    cta_secondary: string;
    pills: string[];
  };
  marquee: { enabled: boolean; items: string[] };
  services: { enabled: boolean; title: string; subtitle: string };
  order: { title: string; subtitle: string; button: string; paused_text: string };
  how: { enabled: boolean; title: string; steps: Step[] };
  guarantees: { enabled: boolean; title: string; items: Item[] };
  faq: { enabled: boolean; title: string };
  footer: { tagline: string; disclaimer: string };
  whatsapp: { quick_message: string; floating_label: string };
}

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    badge: "Онлайн · отвечаем за 15 минут",
    cta_primary: "Написать в WhatsApp",
    cta_secondary: "Смотреть цены",
    pills: ["Без регистрации", "Оценка за 15 минут", "Бесплатные правки", "Антиплагиат"],
  },
  marquee: {
    enabled: true,
    items: ["Курсовые", "Дипломы", "Презентации", "Рефераты", "Эссе", "Отчёты по практике", "Задачи", "Конспекты"],
  },
  services: {
    enabled: true,
    title: "Услуги и цены",
    subtitle: "Тапни по карточке — тип работы подставится в форму.",
  },
  order: {
    title: "Оставить заявку",
    subtitle: "Заполни форму — текст соберётся сам и откроется в WhatsApp.",
    button: "Отправить заявку в WhatsApp",
    paused_text: "Приём заявок временно приостановлен",
  },
  how: {
    enabled: true,
    title: "Как это работает",
    steps: [
      { title: "Заявка", text: "Заполняешь короткую форму — она откроется в WhatsApp уже с готовым текстом." },
      { title: "Оценка стоимости", text: "Менеджер уточняет детали и называет цену и срок. Обычно в течение 15 минут." },
      { title: "Готовая работа", text: "Получаешь работу в срок, проверяешь и при необходимости просишь правки." },
    ],
  },
  guarantees: {
    enabled: true,
    title: "Гарантии",
    items: [
      { title: "Бесплатные правки", text: "Дорабатываем по замечаниям преподавателя в течение срока гарантии." },
      { title: "Проверка на антиплагиат", text: "Проверяем перед сдачей и прикладываем отчёт." },
      { title: "Оформление по ГОСТу", text: "Или по методичке твоего вуза — как требуют." },
      { title: "Соблюдение сроков", text: "Договорились о дате — работа будет готова к ней." },
    ],
  },
  faq: { enabled: true, title: "Частые вопросы" },
  footer: {
    tagline: "Помощь студентам · Казахстан",
    disclaimer: "Материалы предоставляются в качестве образца для самостоятельной подготовки.",
  },
  whatsapp: {
    quick_message: "Здравствуйте! Хочу узнать стоимость работы",
    floating_label: "Написать",
  },
};

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Глубокое слияние: берём значение из raw, если оно того же типа, что и в DEFAULT_CONTENT. */
function merge<T>(def: T, raw: unknown): T {
  if (Array.isArray(def)) {
    if (!Array.isArray(raw)) return def;
    const sample = def[0];
    return raw
      .filter((x) => (sample === undefined ? true : typeof x === typeof sample))
      .map((x) => (isObj(sample) ? merge(sample, x) : x)) as T;
  }
  if (isObj(def)) {
    if (!isObj(raw)) return def;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(def)) out[key] = merge((def as Record<string, unknown>)[key], raw[key]);
    return out as T;
  }
  return typeof raw === typeof def ? (raw as T) : def;
}

export function mergeContent(raw: unknown): SiteContent {
  return merge(DEFAULT_CONTENT, raw);
}
