import "server-only";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import { mockId, mockStore } from "./mock";
import type { Faq, Service, Settings, WhatsAppNumber } from "./types";
import { mergeContent } from "./content";

/**
 * Единый слой доступа к данным. Если Supabase настроен — ходим в него через service role,
 * иначе — работаем с моковым стором в памяти (для локального запуска без ключей).
 */

type Table = "whatsapp_numbers" | "services" | "faq";
type RowOf<T extends Table> = T extends "whatsapp_numbers"
  ? WhatsAppNumber
  : T extends "services"
    ? Service
    : Faq;

function mockList<T extends Table>(table: T): RowOf<T>[] {
  const map = {
    whatsapp_numbers: mockStore.numbers,
    services: mockStore.services,
    faq: mockStore.faq,
  } as const;
  return map[table] as unknown as RowOf<T>[];
}

function fail(error: { message: string } | null): never {
  throw new Error(error?.message ?? "Ошибка базы данных");
}

// ---------- settings ----------

export async function dbGetSettings(): Promise<Settings> {
  if (!isSupabaseConfigured()) return { ...mockStore.settings, content: mergeContent(mockStore.settings.content) };
  const { data, error } = await getSupabase().from("settings").select("*").eq("id", 1).single();
  if (error) fail(error);
  const row = data as Settings & { content?: unknown };
  return { ...row, content: mergeContent(row.content) };
}

export async function dbUpdateSettings(patch: Partial<Omit<Settings, "id">>): Promise<void> {
  if (!isSupabaseConfigured()) {
    Object.assign(mockStore.settings, patch, { updated_at: new Date().toISOString() });
    return;
  }
  const { error } = await getSupabase()
    .from("settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) {
    if (/content/.test(error.message) && /column/i.test(error.message)) {
      throw new Error("В базе нет колонки settings.content. Выполните supabase/migrations/2026-10-02_content.sql в SQL Editor.");
    }
    fail(error);
  }
}

// ---------- generic rows ----------

export async function dbList<T extends Table>(table: T, onlyActive = false): Promise<RowOf<T>[]> {
  if (!isSupabaseConfigured()) {
    const rows = mockList(table)
      .filter((r) => !onlyActive || r.is_active)
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order);
    return rows.map((r) => ({ ...r }));
  }
  let q = getSupabase().from(table).select("*").order("sort_order", { ascending: true });
  if (onlyActive) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) fail(error);
  return (data ?? []) as RowOf<T>[];
}

export async function dbInsert<T extends Table>(
  table: T,
  row: Omit<RowOf<T>, "id" | "sort_order">,
): Promise<RowOf<T>> {
  const existing = await dbList(table);
  const sort_order = existing.length ? Math.max(...existing.map((r) => r.sort_order)) + 1 : 0;
  if (!isSupabaseConfigured()) {
    const created = { ...row, id: mockId(table[0]), sort_order } as RowOf<T>;
    (mockList(table) as RowOf<T>[]).push(created);
    return created;
  }
  const { data, error } = await getSupabase()
    .from(table)
    .insert({ ...row, sort_order })
    .select("*")
    .single();
  if (error) fail(error);
  return data as RowOf<T>;
}

export async function dbUpdate<T extends Table>(
  table: T,
  id: string,
  patch: Partial<Omit<RowOf<T>, "id">>,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    const row = mockList(table).find((r) => r.id === id);
    if (!row) throw new Error("Запись не найдена");
    Object.assign(row, patch);
    return;
  }
  const { error } = await getSupabase().from(table).update(patch as Record<string, unknown>).eq("id", id);
  if (error) fail(error);
}

export async function dbDelete(table: Table, id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const rows = mockList(table);
    const idx = rows.findIndex((r) => r.id === id);
    if (idx >= 0) rows.splice(idx, 1);
    return;
  }
  const { error } = await getSupabase().from(table).delete().eq("id", id);
  if (error) fail(error);
}

/** Сдвигает запись вверх/вниз. Попутно нормализует sort_order во всех строках (0..n-1). */
export async function dbMove(table: Table, id: string, direction: "up" | "down"): Promise<void> {
  const rows = await dbList(table);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error("Запись не найдена");
  const target = direction === "up" ? idx - 1 : idx + 1;
  if (target < 0 || target >= rows.length) return;
  [rows[idx], rows[target]] = [rows[target], rows[idx]];
  const updates = rows
    .map((r, i) => ({ id: r.id, sort_order: i }))
    .filter((u, i) => rows[i].sort_order !== u.sort_order);
  await Promise.all(updates.map((u) => dbUpdate(table, u.id, { sort_order: u.sort_order })));
}
