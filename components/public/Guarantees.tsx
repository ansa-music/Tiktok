import { BadgeCheck, Lock, RefreshCw, ShieldCheck, Sparkles, ThumbsUp, Timer, Wallet } from "lucide-react";
import type { SiteContent } from "@/lib/content";
import { Reveal } from "./Reveal";

const ICONS = [RefreshCw, ShieldCheck, BadgeCheck, Timer, Lock, Wallet, ThumbsUp, Sparkles];

export function Guarantees({ content }: { content: SiteContent["guarantees"] }) {
  if (content.items.length === 0) return null;

  return (
    <section id="guarantees" className="relative py-14 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 top-0 size-80 rounded-full bg-aqua/15 blur-[100px]" />
      </div>
      <div className="mx-auto max-w-5xl px-4">
        <Reveal>
          <h2 className="font-display text-2xl font-bold sm:text-4xl">{content.title}</h2>
        </Reveal>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {content.items.map((g, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal as="li" key={i} delay={i * 90} className="group flex gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-lime/40 sm:p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-wa/15 text-lime transition group-hover:rotate-6 group-hover:bg-wa group-hover:text-ink">
                  <Icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold">{g.title}</h3>
                  {g.text && <p className="mt-1 text-sm text-white/60">{g.text}</p>}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
