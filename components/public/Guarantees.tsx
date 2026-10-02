import { BadgeCheck, RefreshCw, ShieldCheck, Timer } from "lucide-react";

const ITEMS = [
  { icon: RefreshCw, title: "Бесплатные правки", text: "Дорабатываем по замечаниям преподавателя в течение срока гарантии." },
  { icon: ShieldCheck, title: "Проверка на антиплагиат", text: "Проверяем перед сдачей и прикладываем отчёт." },
  { icon: BadgeCheck, title: "Оформление по ГОСТу", text: "Или по методичке вашего вуза — как требуют." },
  { icon: Timer, title: "Соблюдение сроков", text: "Договорились о дате — работа будет готова к ней." },
];

export function Guarantees() {
  return (
    <section id="guarantees" className="bg-white py-14">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Гарантии</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {ITEMS.map((g) => (
            <li key={g.title} className="flex gap-4 rounded-2xl bg-slate-50 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-wa text-white">
                <g.icon className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{g.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{g.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
