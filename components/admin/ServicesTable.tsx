"use client";

import { useState } from "react";
import { Plus, Save } from "lucide-react";
import type { Service } from "@/lib/types";
import { ICON_NAMES, SERVICE_ICONS, getServiceIcon } from "@/lib/icons";
import { createService, deleteService, moveService, toggleService, updateService } from "@/app/admin/actions";
import { DeleteButton, Field, MoveButtons, Toggle, formToObject, useAction } from "./ui";

const GRID = "md:grid-cols-[1.2fr_1.6fr_7rem_7rem_7rem_8rem]";

function IconSelect({ name, defaultValue }: { name: string; defaultValue: string }) {
  return (
    <select name={name} defaultValue={defaultValue} className="field">
      {ICON_NAMES.map((n) => (
        <option key={n} value={n}>{SERVICE_ICONS[n].label}</option>
      ))}
    </select>
  );
}

function ServiceFields({ s }: { s?: Service }) {
  return (
    <>
      <Field label="Название"><input name="title" defaultValue={s?.title ?? ""} required className="field" placeholder="Название" /></Field>
      <Field label="Описание"><input name="description" defaultValue={s?.description ?? ""} className="field" placeholder="Короткое описание" /></Field>
      <Field label="Цена от, ₸"><input name="price_from" type="number" inputMode="numeric" min={0} step={1} defaultValue={s?.price_from ?? ""} required className="field" placeholder="Цена" /></Field>
      <Field label="Единица"><input name="price_unit" defaultValue={s?.price_unit ?? "за работу"} className="field" placeholder="за работу" /></Field>
      <Field label="Срок"><input name="deadline_text" defaultValue={s?.deadline_text ?? ""} className="field" placeholder="от 1 дня" /></Field>
      <Field label="Иконка"><IconSelect name="icon" defaultValue={s?.icon ?? "FileText"} /></Field>
    </>
  );
}

function ServiceRow({ s, isFirst, isLast }: { s: Service; isFirst: boolean; isLast: boolean }) {
  const { pending, call } = useAction();
  const [dirty, setDirty] = useState(false);
  const Icon = getServiceIcon(s.icon);

  return (
    <form
      onChange={() => setDirty(true)}
      onSubmit={(e) => {
        e.preventDefault();
        const data = { ...formToObject(e.currentTarget), is_active: s.is_active };
        call(() => updateService(s.id, data), { onSuccess: () => setDirty(false) });
      }}
      className={`card p-4 ${s.is_active ? "" : "opacity-60"}`}
    >
      <div className={`grid gap-3 ${GRID} md:items-center`}>
        <ServiceFields s={s} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-wa-light text-wa-dark"><Icon className="size-4" aria-hidden /></span>
          <Toggle label={s.is_active ? "Активна" : "Выключена"} checked={s.is_active} disabled={pending} onChange={(v) => call(() => toggleService(s.id, v), { success: v ? "Услуга включена" : "Услуга скрыта" })} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MoveButtons isFirst={isFirst} isLast={isLast} disabled={pending} onUp={() => call(() => moveService(s.id, "up"), { success: "Порядок изменён" })} onDown={() => call(() => moveService(s.id, "down"), { success: "Порядок изменён" })} />
          <DeleteButton what={`услугу «${s.title}»`} disabled={pending} onConfirm={() => call(() => deleteService(s.id), { success: "Услуга удалена" })} />
          <button type="submit" disabled={pending} className={`btn-sm ${dirty ? "btn-wa" : "btn-ghost"}`}>
            <Save className="size-4" aria-hidden />
            Сохранить
          </button>
        </div>
      </div>
    </form>
  );
}

function NewServiceForm({ onDone }: { onDone: () => void }) {
  const { pending, call } = useAction();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        call(() => createService({ ...formToObject(form), is_active: true }), { success: "Услуга добавлена", onSuccess: onDone });
      }}
      className="card border-wa/50 p-4"
    >
      <p className="mb-3 font-semibold">Новая услуга</p>
      <div className={`grid gap-3 ${GRID} md:items-center`}>
        <ServiceFields />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onDone} className="btn-ghost btn-sm">Отмена</button>
        <button type="submit" disabled={pending} className="btn-wa btn-sm"><Plus className="size-4" aria-hidden />Добавить</button>
      </div>
    </form>
  );
}

export function ServicesTable({ services }: { services: Service[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Цены и услуги</h1>
          <p className="text-sm text-slate-500">Меняйте цену прямо в строке и нажимайте «Сохранить». Переключатель «Активна» убирает услугу с сайта (например, если не делаете конспекты).</p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn-wa btn-sm"><Plus className="size-4" aria-hidden />Добавить</button>
        )}
      </div>

      <div className="space-y-3">
        {adding && <NewServiceForm onDone={() => setAdding(false)} />}
        <div className={`hidden gap-3 px-4 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid ${GRID}`}>
          <span>Название</span><span>Описание</span><span>Цена от, ₸</span><span>Единица</span><span>Срок</span><span>Иконка</span>
        </div>
        {services.map((s, i) => (
          <ServiceRow key={JSON.stringify(s)} s={s} isFirst={i === 0} isLast={i === services.length - 1} />
        ))}
        {services.length === 0 && <p className="card p-6 text-center text-slate-500">Услуг пока нет — добавьте первую.</p>}
      </div>
    </section>
  );
}
