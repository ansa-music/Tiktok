"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Send } from "lucide-react";
import type { NumberMode, Service, WhatsAppNumber } from "@/lib/types";
import type { SiteContent } from "@/lib/content";
import { buildMessage, buildWaLink, openLink, pickNumber, type OrderData } from "@/lib/whatsapp";
import { SELECT_SERVICE_EVENT } from "@/lib/events";
import { reachGoal } from "@/lib/analytics";
import { Reveal } from "./Reveal";

interface Props {
  services: Service[];
  numbers: WhatsAppNumber[];
  numberMode: NumberMode;
  template: string;
  content: SiteContent["order"];
}

const EMPTY: OrderData = { type: "", subject: "", topic: "", deadline: "", volume: "", comment: "", name: "" };

/** Сегодняшняя дата в локальном времени как YYYY-MM-DD (для атрибута min). */
function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function OrderForm({ services, numbers, numberMode, template, content }: Props) {
  const [serviceId, setServiceId] = useState("");
  const [data, setData] = useState<OrderData>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [minDate, setMinDate] = useState("");
  const [flash, setFlash] = useState(false);

  const hasNumbers = numbers.some((n) => n.is_active);

  useEffect(() => {
    setMinDate(todayISO());
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (services.some((s) => s.id === id)) {
        setServiceId(id);
        setError(null);
        setFlash(true);
        setTimeout(() => setFlash(false), 900);
      }
    };
    window.addEventListener(SELECT_SERVICE_EVENT, handler);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, handler);
  }, [services]);

  const typeTitle = services.find((s) => s.id === serviceId)?.title ?? "";
  const message = useMemo(() => buildMessage(template, { ...data, type: typeTitle }), [template, data, typeTitle]);

  function set<K extends keyof OrderData>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setData((d) => ({ ...d, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!serviceId) {
      setError("Выберите тип работы");
      return;
    }
    if (data.deadline && minDate && data.deadline < minDate) {
      setError("Срок сдачи не может быть в прошлом");
      return;
    }
    const number = pickNumber(numbers, numberMode);
    if (!number) {
      setError(content.paused_text);
      return;
    }
    setError(null);
    reachGoal("form_submit");
    reachGoal("whatsapp_click");
    openLink(buildWaLink(number.phone, message));
  }

  return (
    <section id="order" className="relative scroll-mt-4 py-14 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-wa/15 blur-[110px]" />
      </div>
      <div className="mx-auto max-w-5xl px-4">
        <Reveal className="mx-auto max-w-xl">
          <div className="relative rounded-[2rem] bg-gradient-to-br from-wa/60 via-white/10 to-aqua/40 p-px">
            <div className="rounded-[calc(2rem-1px)] bg-surface/95 p-5 backdrop-blur sm:p-8">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{content.title}</h2>
              {content.subtitle && <p className="mt-2 text-white/60">{content.subtitle}</p>}

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                <div>
                  <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-white/80">
                    Тип работы <span className="text-lime">*</span>
                  </label>
                  <div className={`relative rounded-2xl transition ${flash ? "ring-4 ring-lime/50" : ""}`}>
                    <select
                      id="type"
                      name="type"
                      required
                      value={serviceId}
                      onChange={(e) => {
                        setServiceId(e.target.value);
                        setError(null);
                      }}
                      className="input-dark appearance-none pr-10"
                    >
                      <option value="">Выберите тип работы</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-white/40" aria-hidden />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-white/80">Предмет</label>
                    <input id="subject" name="subject" type="text" value={data.subject} onChange={set("subject")} className="input-dark" placeholder="например, Экономика" autoComplete="off" />
                  </div>
                  <div>
                    <label htmlFor="deadline" className="mb-1.5 block text-sm font-medium text-white/80">Срок сдачи</label>
                    <input id="deadline" name="deadline" type="date" min={minDate || undefined} value={data.deadline} onChange={set("deadline")} className="input-dark" />
                  </div>
                </div>

                <div>
                  <label htmlFor="topic" className="mb-1.5 block text-sm font-medium text-white/80">Тема</label>
                  <input id="topic" name="topic" type="text" value={data.topic} onChange={set("topic")} className="input-dark" placeholder="Тема работы или задание" autoComplete="off" />
                </div>

                <div>
                  <label htmlFor="volume" className="mb-1.5 block text-sm font-medium text-white/80">Объём</label>
                  <input id="volume" name="volume" type="text" value={data.volume} onChange={set("volume")} className="input-dark" placeholder="например, 25 страниц или 12 слайдов" autoComplete="off" />
                </div>

                <div>
                  <label htmlFor="comment" className="mb-1.5 block text-sm font-medium text-white/80">Комментарий</label>
                  <textarea id="comment" name="comment" rows={3} value={data.comment} onChange={set("comment")} className="input-dark" placeholder="Требования методички, пожелания, ссылки" />
                </div>

                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/80">Имя</label>
                  <input id="name" name="name" type="text" value={data.name} onChange={set("name")} className="input-dark" placeholder="Как к вам обращаться (необязательно)" autoComplete="given-name" />
                </div>

                {error && (
                  <p role="alert" className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={!hasNumbers} className="btn-glow w-full text-lg">
                  <Send className="size-5" aria-hidden />
                  {content.button}
                </button>

                {!hasNumbers && <p className="text-center text-sm font-medium text-amber-300">{content.paused_text}</p>}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowPreview((v) => !v)}
                    className="text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
                    aria-expanded={showPreview}
                  >
                    {showPreview ? "Скрыть текст сообщения" : "Показать текст сообщения"}
                  </button>
                  {showPreview && (
                    <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-ink/60 p-4 text-left text-sm text-white/80">{message}</pre>
                  )}
                </div>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
