"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { dbDelete, dbInsert, dbMove, dbUpdate, dbUpdateSettings } from "@/lib/db";
import { ICON_NAMES } from "@/lib/icons";
import { normalizePhone } from "@/lib/whatsapp";
import type { ActionResult } from "@/lib/types";

// ---------------- Вход / выход ----------------

const MAX_ATTEMPTS = 5;
const BLOCK_MS = 10 * 60 * 1000;
type Attempt = { count: number; blockedUntil: number };
// Простая защита от перебора: хранение в памяти процесса. Для одного владельца этого достаточно.
const g = globalThis as unknown as { __loginAttempts?: Map<string, Attempt> };
const attempts = g.__loginAttempts ?? (g.__loginAttempts = new Map());

async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export interface LoginState {
  error?: string;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { error: "ADMIN_PASSWORD не задан в переменных окружения" };
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return { error: "SESSION_SECRET не задан или короче 32 символов" };
  }

  const ip = await clientIp();
  const now = Date.now();
  const rec = attempts.get(ip) ?? { count: 0, blockedUntil: 0 };
  if (rec.blockedUntil > now) {
    const minutes = Math.ceil((rec.blockedUntil - now) / 60000);
    return { error: `Слишком много попыток. Попробуйте через ${minutes} мин.` };
  }

  if (!password || !safeEqual(password, expected)) {
    rec.count += 1;
    if (rec.count >= MAX_ATTEMPTS) {
      rec.count = 0;
      rec.blockedUntil = now + BLOCK_MS;
      attempts.set(ip, rec);
      return { error: "5 неверных попыток. Вход заблокирован на 10 минут." };
    }
    attempts.set(ip, rec);
    return { error: `Неверный пароль. Осталось попыток: ${MAX_ATTEMPTS - rec.count}` };
  }

  attempts.delete(ip);
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

// ---------------- Общие помощники ----------------

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin");
}

async function run(fn: () => Promise<void>): Promise<ActionResult> {
  await requireAdmin();
  try {
    await fn();
    revalidate();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
    return { ok: false, error: msg };
  }
}

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input);
  if (!r.success) throw new Error(r.error.issues[0]?.message ?? "Проверьте заполнение полей");
  return r.data;
}

const idSchema = z.string().min(1, "Не указан идентификатор записи");
const dirSchema = z.enum(["up", "down"]);
const text = (max: number, name: string) =>
  z.string().trim().max(max, `${name}: не длиннее ${max} символов`);
const required = (max: number, name: string) =>
  text(max, name).min(1, `${name}: обязательное поле`);

// ---------------- Настройки / тексты ----------------

const settingsSchema = z.object({
  site_name: required(80, "Название сайта"),
  hero_title: required(300, "Заголовок"),
  hero_subtitle: text(300, "Подзаголовок"),
  message_template: required(2000, "Шаблон сообщения"),
  yandex_metrika_id: text(20, "ID Метрики").refine((v) => v === "" || /^\d+$/.test(v), "ID Метрики: только цифры"),
});

export async function saveSettings(input: unknown): Promise<ActionResult> {
  return run(async () => {
    const d = parse(settingsSchema, input);
    await dbUpdateSettings({ ...d, yandex_metrika_id: d.yandex_metrika_id || null });
  });
}

export async function setNumberMode(input: unknown): Promise<ActionResult> {
  return run(async () => {
    const mode = parse(z.enum(["random", "first"], { error: "Неизвестный режим" }), input);
    await dbUpdateSettings({ number_mode: mode });
  });
}

// ---------------- Услуги ----------------

const serviceSchema = z.object({
  title: required(120, "Название"),
  description: text(300, "Описание"),
  price_from: z.coerce
    .number({ error: "Цена: укажите число" })
    .int("Цена: целое число")
    .min(0, "Цена: не меньше 0")
    .max(100_000_000, "Цена: слишком большая"),
  price_unit: text(40, "Единица"),
  deadline_text: text(40, "Срок"),
  icon: z.string().refine((v) => ICON_NAMES.includes(v), "Неизвестная иконка"),
  is_active: z.boolean(),
});

export async function createService(input: unknown): Promise<ActionResult> {
  return run(async () => {
    const d = parse(serviceSchema, input);
    await dbInsert("services", d);
  });
}

export async function updateService(id: unknown, input: unknown): Promise<ActionResult> {
  return run(async () => {
    await dbUpdate("services", parse(idSchema, id), parse(serviceSchema, input));
  });
}

export async function toggleService(id: unknown, is_active: unknown): Promise<ActionResult> {
  return run(async () => {
    await dbUpdate("services", parse(idSchema, id), { is_active: parse(z.boolean(), is_active) });
  });
}

export async function moveService(id: unknown, direction: unknown): Promise<ActionResult> {
  return run(async () => dbMove("services", parse(idSchema, id), parse(dirSchema, direction)));
}

export async function deleteService(id: unknown): Promise<ActionResult> {
  return run(async () => dbDelete("services", parse(idSchema, id)));
}

// ---------------- WhatsApp номера ----------------

const numberSchema = z.object({
  label: required(60, "Подпись"),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((v) => v.length >= 10 && v.length <= 15, "Номер: от 10 до 15 цифр, например 77001234567"),
  is_active: z.boolean(),
});

export async function createNumber(input: unknown): Promise<ActionResult> {
  return run(async () => {
    await dbInsert("whatsapp_numbers", parse(numberSchema, input));
  });
}

export async function updateNumber(id: unknown, input: unknown): Promise<ActionResult> {
  return run(async () => {
    await dbUpdate("whatsapp_numbers", parse(idSchema, id), parse(numberSchema, input));
  });
}

export async function toggleNumber(id: unknown, is_active: unknown): Promise<ActionResult> {
  return run(async () => {
    await dbUpdate("whatsapp_numbers", parse(idSchema, id), { is_active: parse(z.boolean(), is_active) });
  });
}

export async function moveNumber(id: unknown, direction: unknown): Promise<ActionResult> {
  return run(async () => dbMove("whatsapp_numbers", parse(idSchema, id), parse(dirSchema, direction)));
}

export async function deleteNumber(id: unknown): Promise<ActionResult> {
  return run(async () => dbDelete("whatsapp_numbers", parse(idSchema, id)));
}

// ---------------- FAQ ----------------

const faqSchema = z.object({
  question: required(200, "Вопрос"),
  answer: required(2000, "Ответ"),
  is_active: z.boolean(),
});

export async function createFaq(input: unknown): Promise<ActionResult> {
  return run(async () => {
    await dbInsert("faq", parse(faqSchema, input));
  });
}

export async function updateFaq(id: unknown, input: unknown): Promise<ActionResult> {
  return run(async () => {
    await dbUpdate("faq", parse(idSchema, id), parse(faqSchema, input));
  });
}

export async function toggleFaq(id: unknown, is_active: unknown): Promise<ActionResult> {
  return run(async () => {
    await dbUpdate("faq", parse(idSchema, id), { is_active: parse(z.boolean(), is_active) });
  });
}

export async function moveFaq(id: unknown, direction: unknown): Promise<ActionResult> {
  return run(async () => dbMove("faq", parse(idSchema, id), parse(dirSchema, direction)));
}

export async function deleteFaq(id: unknown): Promise<ActionResult> {
  return run(async () => dbDelete("faq", parse(idSchema, id)));
}
