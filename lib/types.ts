export type NumberMode = "random" | "first";

export interface Settings {
  id: number;
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  message_template: string;
  number_mode: NumberMode;
  yandex_metrika_id: string | null;
  updated_at?: string | null;
}

export interface WhatsAppNumber {
  id: string;
  label: string;
  phone: string;
  is_active: boolean;
  sort_order: number;
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  price_from: number;
  price_unit: string | null;
  deadline_text: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

export type ActionResult = { ok: true } | { ok: false; error: string };
