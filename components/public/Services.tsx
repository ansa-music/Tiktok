"use client";

import { Clock } from "lucide-react";
import type { Service } from "@/lib/types";
import { getServiceIcon } from "@/lib/icons";
import { selectService } from "@/lib/events";

const price = new Intl.NumberFormat("ru-RU");

export function Services({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section id="services" className="mx-auto max-w-5xl scroll-mt-4 px-4 py-14">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Услуги и цены</h2>
      <p className="mt-2 text-slate-600">Нажмите на карточку — тип работы подставится в форму заявки.</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const Icon = getServiceIcon(s.icon);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => selectService(s.id)}
                className="card group flex h-full w-full flex-col p-5 text-left transition hover:-translate-y-0.5 hover:border-wa hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wa/30"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-wa-light text-wa-dark transition group-hover:bg-wa group-hover:text-white">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="mt-4 text-lg font-semibold">{s.title}</span>
                {s.description && <span className="mt-1 text-sm text-slate-600">{s.description}</span>}
                <span className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1 pt-4">
                  <span className="text-xl font-bold">
                    от {price.format(s.price_from)} ₸
                    {s.price_unit && <span className="ml-1 text-sm font-medium text-slate-500">{s.price_unit}</span>}
                  </span>
                  {s.deadline_text && (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm text-slate-500">
                      <Clock className="size-4" aria-hidden />
                      {s.deadline_text}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
