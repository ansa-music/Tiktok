import { ClipboardCheck, MessageSquareText, PackageCheck, Sparkles, Star, Rocket } from "lucide-react";
import type { SiteContent } from "@/lib/content";
import { Reveal } from "./Reveal";

const ICONS = [ClipboardCheck, MessageSquareText, PackageCheck, Rocket, Star, Sparkles];

export function HowItWorks({ content }: { content: SiteContent["how"] }) {
  if (content.steps.length === 0) return null;

  return (
    <section id="how" className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
      <Reveal>
        <h2 className="font-display text-2xl font-bold sm:text-4xl">{content.title}</h2>
      </Reveal>
      <ol className="relative mt-8 grid gap-4 sm:grid-cols-3">
        <div aria-hidden className="absolute left-7 top-6 h-[calc(100%-3rem)] w-px bg-gradient-to-b from-wa via-lime to-transparent sm:hidden" />
        {content.steps.map((s, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <Reveal as="li" key={i} delay={i * 120} className="glass relative p-5 pl-16 sm:pl-5">
              <span className="font-display absolute right-4 top-3 text-5xl font-black text-white/[0.06]" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="absolute left-3 top-5 grid size-9 place-items-center rounded-xl bg-gradient-to-br from-wa to-lime text-ink shadow-lg shadow-wa/30 sm:static sm:mb-4 sm:size-12">
                <Icon className="size-5 sm:size-6" aria-hidden />
              </span>
              <h3 className="text-lg font-bold">{s.title}</h3>
              {s.text && <p className="mt-1 text-sm text-white/60">{s.text}</p>}
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
