import { ArrowDown, MessageCircle } from "lucide-react";

interface Props {
  siteName: string;
  title: string;
  subtitle: string;
}

export function Hero({ siteName, title, subtitle }: Props) {
  return (
    <header className="relative overflow-hidden bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,theme(colors.wa-light),transparent)]"
      />
      <div className="relative mx-auto max-w-5xl px-4">
        <nav className="flex h-16 items-center justify-between" aria-label="Основная навигация">
          <a href="#top" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-wa text-white">
              <MessageCircle className="size-5" aria-hidden />
            </span>
            {siteName}
          </a>
          <a href="#order" className="btn-ghost btn-sm hidden sm:inline-flex">
            Оставить заявку
          </a>
        </nav>

        <div className="py-12 text-center sm:py-20">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 sm:text-xl">{subtitle}</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#order" className="btn-wa w-full text-lg sm:w-auto">
              <MessageCircle className="size-5" aria-hidden />
              Написать в WhatsApp
            </a>
            <a href="#services" className="btn-ghost w-full sm:w-auto">
              Посмотреть цены
              <ArrowDown className="size-4" aria-hidden />
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <li>Без регистрации</li>
            <li>Оценка за 15 минут</li>
            <li>Бесплатные правки</li>
          </ul>
        </div>
      </div>
    </header>
  );
}
