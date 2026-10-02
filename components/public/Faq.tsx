import { ChevronDown } from "lucide-react";
import type { Faq as FaqItem } from "@/lib/types";

export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="faq" className="mx-auto max-w-5xl px-4 py-14">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Частые вопросы</h2>
      <div className="mt-8 space-y-3">
        {items.map((f) => (
          <details key={f.id} className="card group open:border-wa/60">
            <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-5 py-3 font-semibold">
              {f.question}
              <ChevronDown className="size-5 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="whitespace-pre-line px-5 pb-5 text-slate-600">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
