"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import type { Settings } from "@/lib/types";
import { TEMPLATE_VARS, buildMessage } from "@/lib/whatsapp";
import { saveSettings } from "@/app/admin/actions";
import { useAction } from "./ui";

const VAR_HINTS: Record<(typeof TEMPLATE_VARS)[number], string> = {
  type: "тип работы",
  subject: "предмет",
  topic: "тема",
  deadline: "срок сдачи (ДД.ММ.ГГГГ)",
  volume: "объём",
  comment: "комментарий",
  name: "имя",
};

const SAMPLE = {
  type: "Курсовая работа",
  subject: "Экономика",
  topic: "Анализ рынка онлайн-образования",
  deadline: "2026-12-20",
  volume: "25 страниц",
  comment: "",
  name: "Айдар",
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const { pending, call } = useAction();
  const [form, setForm] = useState({
    site_name: settings.site_name,
    hero_title: settings.hero_title,
    hero_subtitle: settings.hero_subtitle,
    message_template: settings.message_template,
    yandex_metrika_id: settings.yandex_metrika_id ?? "",
  });
  const [dirty, setDirty] = useState(false);
  const preview = useMemo(() => buildMessage(form.message_template, SAMPLE), [form.message_template]);

  function set<K extends keyof typeof form>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setDirty(true);
    };
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        call(() => saveSettings(form), { onSuccess: () => setDirty(false) });
      }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-bold">Тексты сайта</h1>
        <p className="text-sm text-slate-500">Название, главный экран, шаблон сообщения в WhatsApp и аналитика.</p>
      </div>

      <section className="card space-y-4 p-4 sm:p-6">
        <h2 className="font-semibold">Главный экран</h2>
        <div>
          <label htmlFor="site_name" className="label">Название сайта</label>
          <input id="site_name" value={form.site_name} onChange={set("site_name")} className="field" required />
        </div>
        <div>
          <label htmlFor="hero_title" className="label">Заголовок</label>
          <textarea id="hero_title" rows={2} value={form.hero_title} onChange={set("hero_title")} className="field" required />
        </div>
        <div>
          <label htmlFor="hero_subtitle" className="label">Подзаголовок</label>
          <textarea id="hero_subtitle" rows={2} value={form.hero_subtitle} onChange={set("hero_subtitle")} className="field" />
        </div>
      </section>

      <section className="card p-4 sm:p-6">
        <h2 className="font-semibold">Шаблон сообщения в WhatsApp</h2>
        <p className="mt-1 text-sm text-slate-500">
          Строка, в которой переменная осталась пустой, в сообщение не попадает. Доступные переменные:
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {TEMPLATE_VARS.map((v) => (
            <li key={v}>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, message_template: `${f.message_template}{${v}}` }));
                  setDirty(true);
                }}
                className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 hover:bg-slate-200"
                title={`Вставить {${v}} — ${VAR_HINTS[v]}`}
              >
                {`{${v}}`} <span className="font-sans text-slate-500">— {VAR_HINTS[v]}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="message_template" className="label">Шаблон</label>
            <textarea id="message_template" rows={9} value={form.message_template} onChange={set("message_template")} className="field font-mono text-sm" required />
          </div>
          <div>
            <span className="label">Превью (пример с пустым комментарием)</span>
            <pre className="min-h-12 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{preview || "—"}</pre>
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-4 sm:p-6">
        <h2 className="font-semibold">Аналитика</h2>
        <div>
          <label htmlFor="yandex_metrika_id" className="label">ID счётчика Яндекс Метрики</label>
          <input id="yandex_metrika_id" inputMode="numeric" value={form.yandex_metrika_id} onChange={set("yandex_metrika_id")} className="field" placeholder="например, 12345678 (пусто — счётчик выключен)" />
          <p className="mt-1 text-xs text-slate-500">Цели: form_submit — отправка формы, whatsapp_click — любой клик по WhatsApp.</p>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" disabled={pending} className={`${dirty ? "btn-wa" : "btn-ghost"} shadow-lg`}>
          <Save className="size-5" aria-hidden />
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
