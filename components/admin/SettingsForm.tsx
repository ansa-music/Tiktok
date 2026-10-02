"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import type { Settings } from "@/lib/types";
import type { SiteContent } from "@/lib/content";
import { TEMPLATE_VARS, buildMessage } from "@/lib/whatsapp";
import { saveSettings } from "@/app/admin/actions";
import { Toggle, useAction } from "./ui";

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

type Base = {
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  message_template: string;
  yandex_metrika_id: string;
};

/* ---------- мелкие строительные блоки ---------- */

function Section({ title, hint, enabled, onToggle, children, defaultOpen = true }: { title: string; hint?: string; enabled?: boolean; onToggle?: (v: boolean) => void; children: React.ReactNode; defaultOpen?: boolean }) {
  const hasToggle = onToggle !== undefined && enabled !== undefined;
  return (
    <details open={defaultOpen} className="card group relative">
      <summary className={`flex cursor-pointer items-center gap-2 p-4 sm:p-5 ${hasToggle ? "pr-40" : ""}`}>
        <ChevronDown className="size-5 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
        <div>
          <h2 className="font-semibold">{title}</h2>
          {hint && <p className="text-xs text-slate-500">{hint}</p>}
        </div>
      </summary>
      {hasToggle && (
        <span className="absolute right-4 top-4 flex items-center gap-2 sm:right-5 sm:top-5">
          {enabled ? <Eye className="size-4 text-wa-dark" aria-hidden /> : <EyeOff className="size-4 text-slate-400" aria-hidden />}
          <Toggle label={enabled ? "Показывать" : "Скрыта"} checked={enabled} onChange={onToggle} />
        </span>
      )}
      <div className={`space-y-4 border-t border-slate-100 p-4 sm:p-5 ${enabled === false ? "opacity-60" : ""}`}>{children}</div>
    </details>
  );
}

function Text({ label, value, onChange, rows, hint, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string; placeholder?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {rows ? (
        <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="field" placeholder={placeholder} />
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field" placeholder={placeholder} />
      )}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Lines({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string }) {
  return <Text label={label} rows={Math.max(3, Math.min(value.length + 1, 8))} value={value.join("\n")} onChange={(v) => onChange(v.split("\n"))} hint={hint ?? "Каждый пункт с новой строки"} />;
}

function PairList({ value, onChange, max, nameTitle, nameText, addLabel }: { value: { title: string; text: string }[]; onChange: (v: { title: string; text: string }[]) => void; max: number; nameTitle: string; nameText: string; addLabel: string }) {
  const update = (i: number, patch: Partial<{ title: string; text: string }>) => onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {value.map((p, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
            <input value={p.title} onChange={(e) => update(i, { title: e.target.value })} className="field" placeholder={nameTitle} aria-label={`${nameTitle} ${i + 1}`} />
            <textarea value={p.text} onChange={(e) => update(i, { text: e.target.value })} rows={2} className="field" placeholder={nameText} aria-label={`${nameText} ${i + 1}`} />
          </div>
          <div className="mt-2 flex justify-end gap-1">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost btn-sm min-h-9 px-3" aria-label="Выше">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="btn-ghost btn-sm min-h-9 px-3" aria-label="Ниже">↓</button>
            <button type="button" onClick={() => remove(i)} className="btn-danger btn-sm min-h-9 px-3" aria-label="Удалить"><Trash2 className="size-4" aria-hidden /></button>
          </div>
        </div>
      ))}
      {value.length < max && (
        <button type="button" onClick={() => onChange([...value, { title: "", text: "" }])} className="btn-ghost btn-sm">
          <Plus className="size-4" aria-hidden />
          {addLabel}
        </button>
      )}
    </div>
  );
}

/* ---------- форма ---------- */

export function SettingsForm({ settings }: { settings: Settings }) {
  const { pending, call } = useAction();
  const [base, setBase] = useState<Base>({
    site_name: settings.site_name,
    hero_title: settings.hero_title,
    hero_subtitle: settings.hero_subtitle,
    message_template: settings.message_template,
    yandex_metrika_id: settings.yandex_metrika_id ?? "",
  });
  const [c, setC] = useState<SiteContent>(settings.content);
  const [dirty, setDirty] = useState(false);
  const preview = useMemo(() => buildMessage(base.message_template, SAMPLE), [base.message_template]);

  const setB = <K extends keyof Base>(k: K) => (v: Base[K]) => {
    setBase((b) => ({ ...b, [k]: v }));
    setDirty(true);
  };
  const patch = <K extends keyof SiteContent>(k: K) => (p: Partial<SiteContent[K]>) => {
    setC((prev) => ({ ...prev, [k]: { ...prev[k], ...p } }));
    setDirty(true);
  };

  const hero = patch("hero"), marquee = patch("marquee"), services = patch("services"), order = patch("order"),
    how = patch("how"), guarantees = patch("guarantees"), faq = patch("faq"), footer = patch("footer"), whatsapp = patch("whatsapp");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        call(() => saveSettings({ ...base, content: c }), { onSuccess: () => setDirty(false) });
      }}
      className="space-y-4"
    >
      <div>
        <h1 className="text-xl font-bold">Тексты и секции</h1>
        <p className="text-sm text-slate-500">Любой текст на сайте можно поменять здесь. Секции можно скрыть переключателем «Показывать». Отдельные услуги (например, «Конспект») выключаются во вкладке «Цены и услуги».</p>
      </div>

      <Section title="Главный экран" hint="Первое, что видит студент">
        <Text label="Название сайта" value={base.site_name} onChange={setB("site_name")} />
        <Text label="Заголовок" rows={2} value={base.hero_title} onChange={setB("hero_title")} />
        <Text label="Подзаголовок" rows={2} value={base.hero_subtitle} onChange={setB("hero_subtitle")} />
        <Text label="Бейдж над заголовком" value={c.hero.badge} onChange={(v) => hero({ badge: v })} hint="Пусто — бейдж не показывается" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Главная кнопка" value={c.hero.cta_primary} onChange={(v) => hero({ cta_primary: v })} />
          <Text label="Вторая кнопка" value={c.hero.cta_secondary} onChange={(v) => hero({ cta_secondary: v })} hint="Пусто — кнопка не показывается" />
        </div>
        <Lines label="Преимущества под кнопками" value={c.hero.pills} onChange={(v) => hero({ pills: v })} hint="До 6 коротких пунктов, каждый с новой строки" />
      </Section>

      <Section title="Бегущая строка" hint="Зелёная лента под главным экраном" enabled={c.marquee.enabled} onToggle={(v) => marquee({ enabled: v })}>
        <Lines label="Слова в ленте" value={c.marquee.items} onChange={(v) => marquee({ items: v })} />
      </Section>

      <Section title="Услуги и цены" hint="Сами услуги редактируются во вкладке «Цены и услуги»" enabled={c.services.enabled} onToggle={(v) => services({ enabled: v })}>
        <Text label="Заголовок секции" value={c.services.title} onChange={(v) => services({ title: v })} />
        <Text label="Подзаголовок" value={c.services.subtitle} onChange={(v) => services({ subtitle: v })} />
      </Section>

      <Section title="Форма заявки" hint="Эту секцию скрыть нельзя — без неё сайт не работает">
        <Text label="Заголовок" value={c.order.title} onChange={(v) => order({ title: v })} />
        <Text label="Подзаголовок" value={c.order.subtitle} onChange={(v) => order({ subtitle: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Кнопка отправки" value={c.order.button} onChange={(v) => order({ button: v })} />
          <Text label="Текст, когда нет активных номеров" value={c.order.paused_text} onChange={(v) => order({ paused_text: v })} />
        </div>
      </Section>

      <Section title="Как это работает" enabled={c.how.enabled} onToggle={(v) => how({ enabled: v })}>
        <Text label="Заголовок секции" value={c.how.title} onChange={(v) => how({ title: v })} />
        <PairList value={c.how.steps} onChange={(v) => how({ steps: v })} max={6} nameTitle="Название шага" nameText="Описание шага" addLabel="Добавить шаг" />
      </Section>

      <Section title="Гарантии" enabled={c.guarantees.enabled} onToggle={(v) => guarantees({ enabled: v })}>
        <Text label="Заголовок секции" value={c.guarantees.title} onChange={(v) => guarantees({ title: v })} />
        <PairList value={c.guarantees.items} onChange={(v) => guarantees({ items: v })} max={8} nameTitle="Гарантия" nameText="Пояснение" addLabel="Добавить гарантию" />
      </Section>

      <Section title="FAQ" hint="Вопросы редактируются во вкладке «FAQ»" enabled={c.faq.enabled} onToggle={(v) => faq({ enabled: v })}>
        <Text label="Заголовок секции" value={c.faq.title} onChange={(v) => faq({ title: v })} />
      </Section>

      <Section title="Подвал и кнопки WhatsApp" defaultOpen={false}>
        <Text label="Подпись в подвале" value={c.footer.tagline} onChange={(v) => footer({ tagline: v })} />
        <Text label="Мелкий текст (дисклеймер)" rows={2} value={c.footer.disclaimer} onChange={(v) => footer({ disclaimer: v })} />
        <Text label="Текст плавающей кнопки" value={c.whatsapp.floating_label} onChange={(v) => whatsapp({ floating_label: v })} />
        <Text label="Сообщение при клике по кнопке WhatsApp (не из формы)" rows={2} value={c.whatsapp.quick_message} onChange={(v) => whatsapp({ quick_message: v })} />
      </Section>

      <Section title="Шаблон сообщения из формы" defaultOpen={false}>
        <p className="text-sm text-slate-500">Строка, в которой переменная осталась пустой, в сообщение не попадает. Нажмите на переменную, чтобы вставить её в конец шаблона:</p>
        <ul className="flex flex-wrap gap-2">
          {TEMPLATE_VARS.map((v) => (
            <li key={v}>
              <button
                type="button"
                onClick={() => setB("message_template")(`${base.message_template}{${v}}`)}
                className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 hover:bg-slate-200"
                title={`Вставить {${v}} — ${VAR_HINTS[v]}`}
              >
                {`{${v}}`} <span className="font-sans text-slate-500">— {VAR_HINTS[v]}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="message_template" className="label">Шаблон</label>
            <textarea id="message_template" rows={9} value={base.message_template} onChange={(e) => setB("message_template")(e.target.value)} className="field font-mono text-sm" required />
          </div>
          <div>
            <span className="label">Превью (пример с пустым комментарием)</span>
            <pre className="min-h-12 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{preview || "—"}</pre>
          </div>
        </div>
      </Section>

      <Section title="Аналитика" defaultOpen={false}>
        <Text label="ID счётчика Яндекс Метрики" value={base.yandex_metrika_id} onChange={setB("yandex_metrika_id")} placeholder="например, 12345678 (пусто — счётчик выключен)" hint="Цели: form_submit — отправка формы, whatsapp_click — любой клик по WhatsApp." />
      </Section>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button type="submit" disabled={pending} className={`${dirty ? "btn-wa" : "btn-ghost"} shadow-lg`}>
          <Save className="size-5" aria-hidden />
          {pending ? "Сохраняем…" : dirty ? "Сохранить изменения" : "Сохранено"}
        </button>
      </div>
    </form>
  );
}
