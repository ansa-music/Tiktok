import { ClipboardCheck, MessageSquareText, PackageCheck } from "lucide-react";

const STEPS = [
  { icon: ClipboardCheck, title: "Заявка", text: "Заполняете короткую форму — она откроется в WhatsApp уже с готовым текстом." },
  { icon: MessageSquareText, title: "Оценка стоимости", text: "Менеджер уточняет детали и называет цену и срок. Обычно в течение 15 минут." },
  { icon: PackageCheck, title: "Готовая работа", text: "Получаете работу в срок, проверяете и при необходимости просите правки." },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-5xl px-4 py-14">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Как это работает</h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="card relative p-5">
            <span className="absolute right-4 top-4 text-4xl font-black text-slate-100" aria-hidden>
              {i + 1}
            </span>
            <span className="grid size-12 place-items-center rounded-xl bg-wa-light text-wa-dark">
              <s.icon className="size-6" aria-hidden />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
