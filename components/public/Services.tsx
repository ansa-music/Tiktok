"use client";

import { ArrowUpRight, Clock } from "lucide-react";
import type { Service } from "@/lib/types";
import type { SiteContent } from "@/lib/content";
import { getServiceIcon } from "@/lib/icons";
import { selectService } from "@/lib/events";
import { Reveal } from "./Reveal";

const price = new Intl.NumberFormat("ru-RU");

export function Services({ services, content }: { services: Service[]; content: SiteContent["services"] }) {
  if (services.length === 0) return null;

  return (
    <section id="services" className="mx-auto max-w-5xl scroll-mt-4 px-4 py-14 sm:py-20">
      <Reveal>
        <h2 className="font-display text-2xl font-bold sm:text-4xl">{content.title}</h2>
        {content.subtitle && <p className="mt-2 text-white/60">{content.subtitle}</p>}
      </Reveal>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {services.map((s, i) => {
          const Icon = getServiceIcon(s.icon);
          return (
            <Reveal as="li" key={s.id} delay={Math.min(i, 5) * 70}>
              <button
                type="button"
                onClick={() => selectService(s.id)}
                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-wa/60 hover:bg-white/[0.07] hover:shadow-[0_20px_60px_-20px_rgb(37_211_102_/_0.5)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wa/40 active:scale-[0.98] sm:flex-col sm:items-start sm:p-5"
              >
                <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-wa/20 blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-wa/25 to-lime/15 text-lime transition duration-300 group-hover:scale-110 group-hover:from-wa group-hover:to-lime group-hover:text-ink">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-base font-bold sm:text-lg">
                    {s.title}
                    <ArrowUpRight className="size-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime" aria-hidden />
                  </span>
                  {s.description && <span className="mt-0.5 line-clamp-2 block text-sm text-white/55">{s.description}</span>}
                  <span className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 sm:mt-4">
                    <span className="font-display text-base font-bold text-gradient sm:text-xl">
                      от {price.format(s.price_from)} ₸
                      {s.price_unit && <span className="ml-1 font-sans text-xs font-medium text-white/50 sm:text-sm">{s.price_unit}</span>}
                    </span>
                    {s.deadline_text && (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-white/50 sm:text-sm">
                        <Clock className="size-3.5" aria-hidden />
                        {s.deadline_text}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
