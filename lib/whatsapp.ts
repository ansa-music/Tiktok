import type { NumberMode, WhatsAppNumber } from "./types";

/** Данные формы заявки. Все поля — строки, пустая строка = поле не заполнено. */
export interface OrderData {
  type: string;
  subject: string;
  topic: string;
  deadline: string; // YYYY-MM-DD из <input type="date"> либо уже отформатированная дата
  volume: string;
  comment: string;
  name: string;
}

export const TEMPLATE_VARS = ["type", "subject", "topic", "deadline", "volume", "comment", "name"] as const;
export type TemplateVar = (typeof TEMPLATE_VARS)[number];

/** YYYY-MM-DD → ДД.ММ.ГГГГ. Остальные строки возвращает как есть. */
export function formatDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return value.trim();
  return `${m[3]}.${m[2]}.${m[1]}`;
}

/**
 * Подставляет данные в шаблон. Строка, в которой хотя бы одна переменная оказалась пустой,
 * удаляется целиком. Дата форматируется как ДД.ММ.ГГГГ.
 */
export function buildMessage(template: string, data: OrderData): string {
  const values: Record<TemplateVar, string> = {
    type: data.type.trim(),
    subject: data.subject.trim(),
    topic: data.topic.trim(),
    deadline: formatDate(data.deadline),
    volume: data.volume.trim(),
    comment: data.comment.trim(),
    name: data.name.trim(),
  };
  const re = /\{(type|subject|topic|deadline|volume|comment|name)\}/g;

  return template
    .split(/\r?\n/)
    .filter((line) => {
      const vars = [...line.matchAll(re)].map((m) => m[1] as TemplateVar);
      return vars.every((v) => values[v] !== "");
    })
    .map((line) => line.replace(re, (_, v: TemplateVar) => values[v]))
    .join("\n")
    .trim();
}

/** Выбирает номер: 'first' — первый активный по sort_order, 'random' — случайный из активных. */
export function pickNumber(numbers: WhatsAppNumber[], mode: NumberMode): WhatsAppNumber | null {
  const active = numbers.filter((n) => n.is_active).sort((a, b) => a.sort_order - b.sort_order);
  if (active.length === 0) return null;
  if (mode === "first") return active[0];
  return active[Math.floor(Math.random() * active.length)];
}

export function buildWaLink(phone: string, text: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;
}

/** Оставляет только цифры; 8XXXXXXXXXX (11 цифр) → 7XXXXXXXXXX. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) digits = "7" + digits.slice(1);
  return digits;
}

/** 77001234567 → +7 700 123-45-67 (для отображения). */
export function formatPhone(phone: string): string {
  const d = normalizePhone(phone);
  if (d.length === 11) {
    return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  }
  return `+${d}`;
}

/** Открывает ссылку в новой вкладке; если браузер (Safari) заблокировал — переходим в текущей. */
export function openLink(link: string): void {
  const win = window.open(link, "_blank", "noopener,noreferrer");
  if (!win) window.location.href = link;
}

export const QUICK_MESSAGE = "Здравствуйте! Хочу узнать стоимость работы";
