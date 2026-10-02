"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Faq as FaqItem } from "@/lib/types";
import type { SiteContent } from "@/lib/content";
import { Reveal } from "./Reveal";

export function Faq({ items, content }: { items: FaqItem[]; content: SiteContent["faq"] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (items.length === 0) return null;

  return (
    <section id="faq" className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
      <Reveal>
        <h2 className="font-display text-2xl font-bold sm:text-4xl">{content.title}</h2>
      </Reveal>
      <div className="mt-8 space-y-3">
        {items.map((f, i) => {
          const isOpen = open === f.id;
          return (
            <Reveal key={f.id} delay={i * 60} className={`glass overflow-hidden transition ${isOpen ? "border-wa/50" : ""}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : f.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-${f.id}`}
                className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-3 text-left font-semibold"
              >
                {f.question}
                <span className={`grid size-8 shrink-0 place-items-center rounded-full bg-white/10 transition duration-300 ${isOpen ? "rotate-45 bg-wa text-ink" : ""}`}>
                  <Plus className="size-4" aria-hidden />
                </span>
              </button>
              <div id={`faq-${f.id}`} className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <p className="whitespace-pre-line px-5 pb-5 text-white/65">{f.answer}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
