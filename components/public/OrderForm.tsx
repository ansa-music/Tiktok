"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Send } from "lucide-react";
import type { NumberMode, Service, WhatsAppNumber } from "@/lib/types";
import { buildMessage, buildWaLink, openLink, pickNumber, type OrderData } from "@/lib/whatsapp";
import { SELECT_SERVICE_EVENT } from "@/lib/events";
import { reachGoal } from "@/lib/analytics";

interface Props {
  services: Service[];
  numbers: WhatsAppNumber[];
  numberMode: NumberMode;
  template: string;
}

const EMPTY: OrderData = { type: "", subject: "", topic: "", deadline: "", volume: "", comment: "", name: "" };

/** Сегодняшняя дата в локальном времени как YYYY-MM-DD (для атрибута min). */
function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function OrderForm({ services, numbers, numberMode, template }: Props) {
  const [serviceId, setServiceId] = useState("");
  const [data, setData] = useState<OrderData>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [minDate, setMinDate] = useState("");

  const hasNumbers = numbers.some((n) => n.is_active);

  useEffect(() => {
    setMinDate(todayISO());
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (services.some((s) => s.id === id)) {
        setServiceId(id);
        setError(null);
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
      setError("Приём заявок временно приостановлен");
      return;
    }
    setError(null);
    reachGoal("form_submit");
    reachGoal("whatsapp_click");
    openLink(buildWaLink(number.phone, message));
  }

  return (
    <section id="order" className="scroll-mt-4 bg-white py-14">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Оставить заявку</h2>
          <p className="mt-2 text-slate-600">
            Заполните форму — текст заявки сформируется автоматически и откроется в WhatsApp.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="type" className="label">
                Тип работы <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="type"
                  name="type"
                  required
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    setError(null);
                  }}
                  className="field appearance-none pr-10"
                >
                  <option value="">Выберите тип работы</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="subject" className="label">Предмет</label>
                <input id="subject" name="subject" type="text" value={data.subject} onChange={set("subject")} className="field" placeholder="например, Экономика" autoComplete="off" />
              </div>
              <div>
                <label htmlFor="deadline" className="label">Срок сдачи</label>
                <input id="deadline" name="deadline" type="date" min={minDate || undefined} value={data.deadline} onChange={set("deadline")} className="field" />
              </div>
            </div>

            <div>
              <label htmlFor="topic" className="label">Тема</label>
              <input id="topic" name="topic" type="text" value={data.topic} onChange={set("topic")} className="field" placeholder="Тема работы или задание" autoComplete="off" />
            </div>

            <div>
              <label htmlFor="volume" className="label">Объём</label>
              <input id="volume" name="volume" type="text" value={data.volume} onChange={set("volume")} className="field" placeholder="например, 25 страниц или 12 слайдов" autoComplete="off" />
            </div>

            <div>
              <label htmlFor="comment" className="label">Комментарий</label>
              <textarea id="comment" name="comment" rows={3} value={data.comment} onChange={set("comment")} className="field" placeholder="Требования методички, пожелания, ссылки" />
            </div>

            <div>
              <label htmlFor="name" className="label">Имя</label>
              <input id="name" name="name" type="text" value={data.name} onChange={set("name")} className="field" placeholder="Как к вам обращаться (необязательно)" autoComplete="given-name" />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button type="submit" disabled={!hasNumbers} className="btn-wa w-full text-lg">
              <Send className="size-5" aria-hidden />
              Отправить заявку в WhatsApp
            </button>

            {!hasNumbers && (
              <p className="text-center text-sm font-medium text-amber-700">Приём заявок временно приостановлен</p>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-sm text-slate-500 underline-offset-4 hover:underline"
                aria-expanded={showPreview}
              >
                {showPreview ? "Скрыть текст сообщения" : "Показать текст сообщения"}
              </button>
              {showPreview && (
                <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-700">{message}</pre>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
