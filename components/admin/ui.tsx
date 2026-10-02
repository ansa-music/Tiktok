"use client";

import { useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { ActionResult } from "@/lib/types";
import { useToast } from "./Toast";

/** Обёртка над вызовом server action: индикатор загрузки + toast с результатом. */
export function useAction() {
  const toast = useToast();
  const [pending, start] = useTransition();

  function call(fn: () => Promise<ActionResult>, opts: { success?: string; onSuccess?: () => void } = {}) {
    start(async () => {
      try {
        const r = await fn();
        if (r.ok) {
          toast.success(opts.success ?? "Сохранено");
          opts.onSuccess?.();
        } else {
          toast.error(r.error);
        }
      } catch {
        toast.error("Не удалось связаться с сервером. Попробуйте ещё раз.");
      }
    });
  }

  return { pending, call };
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 select-none">
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-wa peer-focus-visible:ring-4 peer-focus-visible:ring-wa/30 peer-disabled:opacity-50 after:absolute after:left-0.5 after:top-0.5 after:size-6 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

export function MoveButtons({ onUp, onDown, isFirst, isLast, disabled }: { onUp: () => void; onDown: () => void; isFirst: boolean; isLast: boolean; disabled?: boolean }) {
  const cls = "grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40";
  return (
    <div className="flex gap-1">
      <button type="button" onClick={onUp} disabled={disabled || isFirst} className={cls} aria-label="Выше"><ArrowUp className="size-4" aria-hidden /></button>
      <button type="button" onClick={onDown} disabled={disabled || isLast} className={cls} aria-label="Ниже"><ArrowDown className="size-4" aria-hidden /></button>
    </div>
  );
}

export function DeleteButton({ onConfirm, what, disabled }: { onConfirm: () => void; what: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { if (window.confirm(`Удалить ${what}? Это действие нельзя отменить.`)) onConfirm(); }}
      className="btn-danger btn-sm"
    >
      <Trash2 className="size-4" aria-hidden />
      Удалить
    </button>
  );
}

/** Собирает значения формы в объект. Чекбоксы приходят как boolean. */
export function formToObject(form: HTMLFormElement): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  const fd = new FormData(form);
  for (const el of Array.from(form.elements)) {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) || !el.name) continue;
    out[el.name] = el instanceof HTMLInputElement && el.type === "checkbox" ? el.checked : String(fd.get(el.name) ?? "");
  }
  return out;
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="label md:sr-only">{label}</span>
      {children}
    </label>
  );
}
