import { ArrowDown, MessageCircle, Sparkles, Zap } from "lucide-react";
import type { Service } from "@/lib/types";
import type { SiteContent } from "@/lib/content";
import { getServiceIcon } from "@/lib/icons";

interface Props {
  siteName: string;
  title: string;
  subtitle: string;
  content: SiteContent["hero"];
  highlights: Service[];
}

const price = new Intl.NumberFormat("ru-RU");

export function Hero({ siteName, title, subtitle, content, highlights }: Props) {
  return (
    <header className="relative isolate overflow-hidden">
      {/* фон: анимированные пятна + сетка */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 size-[22rem] rounded-full bg-wa/35 blur-[90px] animate-blob sm:size-[30rem]" />
        <div className="absolute -right-28 top-1/4 size-[20rem] rounded-full bg-aqua/25 blur-[90px] animate-blob [animation-delay:-6s] sm:size-[28rem]" />
        <div className="absolute -bottom-32 left-1/3 size-[22rem] rounded-full bg-lime/20 blur-[100px] animate-blob [animation-delay:-12s]" />
        <div className="grid-bg absolute inset-0" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <nav className="flex h-16 items-center justify-between" aria-label="Основная навигация">
          <a href="#top" className="font-display flex items-center gap-2 text-base font-bold sm:text-lg">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-wa to-lime text-ink shadow-lg shadow-wa/30">
              <Zap className="size-5" aria-hidden />
            </span>
            {siteName}
          </a>
          <a href="#order" className="btn-outline min-h-10 rounded-xl px-4 text-sm">
            Заявка
          </a>
        </nav>

        <div className="relative pb-16 pt-10 text-center sm:pb-24 sm:pt-16">
          {content.badge && (
            <p className="reveal in mx-auto inline-flex items-center gap-2 rounded-full border border-wa/30 bg-wa/10 px-4 py-1.5 text-xs font-semibold text-wa sm:text-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-wa animate-ping-slow" />
                <span className="relative inline-flex size-2 rounded-full bg-wa" />
              </span>
              {content.badge}
            </p>
          )}

          <h1 className="font-display mx-auto mt-5 max-w-3xl bg-gradient-to-br from-white via-white to-lime bg-clip-text text-[2rem] font-black leading-[1.08] text-transparent sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/70 sm:text-xl">{subtitle}</p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a href="#order" className="btn-glow text-lg">
              <MessageCircle className="size-5" aria-hidden />
              {content.cta_primary}
            </a>
            {content.cta_secondary && (
              <a href="#services" className="btn-outline">
                {content.cta_secondary}
                <ArrowDown className="size-4" aria-hidden />
              </a>
            )}
          </div>

          {content.pills.length > 0 && (
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {content.pills.map((p) => (
                <li key={p} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 sm:text-sm">
                  {p}
                </li>
              ))}
            </ul>
          )}

          {/* плавающие чипы с ценами */}
          {highlights.length > 0 && (
            <ul aria-hidden className="pointer-events-none mt-10 flex flex-wrap justify-center gap-3 sm:mt-14">
              {highlights.slice(0, 3).map((s, i) => {
                const Icon = getServiceIcon(s.icon);
                return (
                  <li
                    key={s.id}
                    className={`glass flex items-center gap-2 px-4 py-2.5 text-sm shadow-xl ${i % 2 ? "animate-float-slow" : "animate-float"}`}
                    style={{ animationDelay: `${i * -2.3}s` }}
                  >
                    <Icon className="size-4 text-lime" />
                    <span className="font-medium">{s.title}</span>
                    <span className="text-white/60">от {price.format(s.price_from)} ₸</span>
                  </li>
                );
              })}
            </ul>
          )}

          <Sparkles aria-hidden className="absolute right-2 top-6 size-6 text-lime/70 animate-wiggle sm:right-10" />
        </div>
      </div>
    </header>
  );
}
