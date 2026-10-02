"use client";

import { useState } from "react";
import { Plus, Save } from "lucide-react";
import type { Faq } from "@/lib/types";
import { createFaq, deleteFaq, moveFaq, toggleFaq, updateFaq } from "@/app/admin/actions";
import { DeleteButton, Field, MoveButtons, Toggle, formToObject, useAction } from "./ui";

function FaqFields({ f }: { f?: Faq }) {
  return (
    <>
      <Field label="Вопрос"><input name="question" defaultValue={f?.question ?? ""} required className="field" placeholder="Вопрос" /></Field>
      <Field label="Ответ"><textarea name="answer" defaultValue={f?.answer ?? ""} required rows={2} className="field" placeholder="Ответ" /></Field>
    </>
  );
}

function FaqRow({ f, isFirst, isLast }: { f: Faq; isFirst: boolean; isLast: boolean }) {
  const { pending, call } = useAction();
  const [dirty, setDirty] = useState(false);

  return (
    <form
      onChange={() => setDirty(true)}
      onSubmit={(e) => {
        e.preventDefault();
        const data = { ...formToObject(e.currentTarget), is_active: f.is_active };
        call(() => updateFaq(f.id, data), { onSuccess: () => setDirty(false) });
      }}
      className={`card p-4 ${f.is_active ? "" : "opacity-60"}`}
    >
      <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
        <FaqFields f={f} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <Toggle label={f.is_active ? "Показывается" : "Скрыт"} checked={f.is_active} disabled={pending} onChange={(v) => call(() => toggleFaq(f.id, v), { success: v ? "Вопрос показан" : "Вопрос скрыт" })} />
        <div className="flex flex-wrap items-center gap-2">
          <MoveButtons isFirst={isFirst} isLast={isLast} disabled={pending} onUp={() => call(() => moveFaq(f.id, "up"), { success: "Порядок изменён" })} onDown={() => call(() => moveFaq(f.id, "down"), { success: "Порядок изменён" })} />
          <DeleteButton what="вопрос" disabled={pending} onConfirm={() => call(() => deleteFaq(f.id), { success: "Вопрос удалён" })} />
          <button type="submit" disabled={pending} className={`btn-sm ${dirty ? "btn-wa" : "btn-ghost"}`}>
            <Save className="size-4" aria-hidden />
            Сохранить
          </button>
        </div>
      </div>
    </form>
  );
}

function NewFaqForm({ onDone }: { onDone: () => void }) {
  const { pending, call } = useAction();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        call(() => createFaq({ ...formToObject(form), is_active: true }), { success: "Вопрос добавлен", onSuccess: onDone });
      }}
      className="card border-wa/50 p-4"
    >
      <p className="mb-3 font-semibold">Новый вопрос</p>
      <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
        <FaqFields />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onDone} className="btn-ghost btn-sm">Отмена</button>
        <button type="submit" disabled={pending} className="btn-wa btn-sm"><Plus className="size-4" aria-hidden />Добавить</button>
      </div>
    </form>
  );
}

export function FaqTable({ items }: { items: Faq[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">FAQ</h1>
          <p className="text-sm text-slate-500">Вопросы показываются на сайте в заданном порядке.</p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn-wa btn-sm"><Plus className="size-4" aria-hidden />Добавить</button>
        )}
      </div>
      <div className="space-y-3">
        {adding && <NewFaqForm onDone={() => setAdding(false)} />}
        <div className="hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid md:grid-cols-[1fr_2fr]">
          <span>Вопрос</span><span>Ответ</span>
        </div>
        {items.map((f, i) => (
          <FaqRow key={JSON.stringify(f)} f={f} isFirst={i === 0} isLast={i === items.length - 1} />
        ))}
        {items.length === 0 && <p className="card p-6 text-center text-slate-500">Вопросов пока нет.</p>}
      </div>
    </section>
  );
}
