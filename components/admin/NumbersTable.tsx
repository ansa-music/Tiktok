"use client";

import { useState } from "react";
import { ExternalLink, Plus, Save } from "lucide-react";
import type { NumberMode, WhatsAppNumber } from "@/lib/types";
import { formatPhone, normalizePhone } from "@/lib/whatsapp";
import { createNumber, deleteNumber, moveNumber, setNumberMode, toggleNumber, updateNumber } from "@/app/admin/actions";
import { DeleteButton, Field, MoveButtons, Toggle, formToObject, useAction } from "./ui";

const GRID = "md:grid-cols-[1fr_1fr]";

function NumberFields({ n }: { n?: WhatsAppNumber }) {
  return (
    <>
      <Field label="Подпись"><input name="label" defaultValue={n?.label ?? ""} required className="field" placeholder="Менеджер Айгерим" /></Field>
      <Field label="Номер WhatsApp"><input name="phone" type="tel" inputMode="tel" defaultValue={n?.phone ?? ""} required className="field" placeholder="77001234567" /></Field>
    </>
  );
}

function NumberRow({ n, isFirst, isLast }: { n: WhatsAppNumber; isFirst: boolean; isLast: boolean }) {
  const { pending, call } = useAction();
  const [dirty, setDirty] = useState(false);

  return (
    <form
      onChange={() => setDirty(true)}
      onSubmit={(e) => {
        e.preventDefault();
        const data = { ...formToObject(e.currentTarget), is_active: n.is_active };
        call(() => updateNumber(n.id, data), { onSuccess: () => setDirty(false) });
      }}
      className={`card p-4 ${n.is_active ? "" : "opacity-60"}`}
    >
      <div className={`grid gap-3 ${GRID} md:items-center`}>
        <NumberFields n={n} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-3">
          <Toggle label={n.is_active ? "Активен" : "Выключен"} checked={n.is_active} disabled={pending} onChange={(v) => call(() => toggleNumber(n.id, v), { success: v ? "Номер включён" : "Номер выключен" })} />
          <a href={`https://wa.me/${normalizePhone(n.phone)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm" title={formatPhone(n.phone)}>
            <ExternalLink className="size-4" aria-hidden />
            Проверить
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MoveButtons isFirst={isFirst} isLast={isLast} disabled={pending} onUp={() => call(() => moveNumber(n.id, "up"), { success: "Порядок изменён" })} onDown={() => call(() => moveNumber(n.id, "down"), { success: "Порядок изменён" })} />
          <DeleteButton what={`номер «${n.label}»`} disabled={pending} onConfirm={() => call(() => deleteNumber(n.id), { success: "Номер удалён" })} />
          <button type="submit" disabled={pending} className={`btn-sm ${dirty ? "btn-wa" : "btn-ghost"}`}>
            <Save className="size-4" aria-hidden />
            Сохранить
          </button>
        </div>
      </div>
    </form>
  );
}

function NewNumberForm({ onDone }: { onDone: () => void }) {
  const { pending, call } = useAction();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        call(() => createNumber({ ...formToObject(form), is_active: true }), { success: "Номер добавлен", onSuccess: onDone });
      }}
      className="card border-wa/50 p-4"
    >
      <p className="mb-3 font-semibold">Новый номер</p>
      <div className={`grid gap-3 ${GRID} md:items-center`}>
        <NumberFields />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onDone} className="btn-ghost btn-sm">Отмена</button>
        <button type="submit" disabled={pending} className="btn-wa btn-sm"><Plus className="size-4" aria-hidden />Добавить</button>
      </div>
    </form>
  );
}

export function NumbersTable({ numbers, mode }: { numbers: WhatsAppNumber[]; mode: NumberMode }) {
  const [adding, setAdding] = useState(false);
  const { pending, call } = useAction();
  const activeCount = numbers.filter((n) => n.is_active).length;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">WhatsApp номера</h1>
          <p className="text-sm text-slate-500">Только цифры с кодом страны: 77001234567. Номер с 8 в начале переводится в 7 автоматически.</p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn-wa btn-sm"><Plus className="size-4" aria-hidden />Добавить</button>
        )}
      </div>

      <div className="card mb-4 p-4">
        <p className="font-semibold">Кому отправлять заявки</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
          {([
            ["random", "Случайный менеджер", "заявки распределяются между всеми активными номерами"],
            ["first", "Всегда первый", "все заявки идут на первый активный номер по порядку"],
          ] as const).map(([value, label, hint]) => (
            <label key={value} className="flex cursor-pointer items-start gap-2">
              <input type="radio" name="number_mode" value={value} checked={mode === value} disabled={pending} onChange={() => call(() => setNumberMode(value), { success: "Режим сохранён" })} className="mt-1 size-4 accent-wa" />
              <span><span className="font-medium">{label}</span><br /><span className="text-sm text-slate-500">{hint}</span></span>
            </label>
          ))}
        </div>
        {activeCount === 0 && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">Нет активных номеров — на сайте показано «Приём заявок временно приостановлен».</p>
        )}
      </div>

      <div className="space-y-3">
        {adding && <NewNumberForm onDone={() => setAdding(false)} />}
        <div className={`hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid ${GRID}`}>
          <span>Подпись</span><span>Номер</span>
        </div>
        {numbers.map((n, i) => (
          <NumberRow key={JSON.stringify(n)} n={n} isFirst={i === 0} isLast={i === numbers.length - 1} />
        ))}
        {numbers.length === 0 && <p className="card p-6 text-center text-slate-500">Номеров пока нет — добавьте первый.</p>}
      </div>
    </section>
  );
}
