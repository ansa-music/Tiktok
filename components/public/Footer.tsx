import type { NumberMode, WhatsAppNumber } from "@/lib/types";
import { WhatsAppButton } from "./WhatsAppButton";

interface Props {
  siteName: string;
  numbers: WhatsAppNumber[];
  mode: NumberMode;
}

export function Footer({ siteName, numbers, mode }: Props) {
  return (
    <footer className="border-t border-slate-200 bg-white pb-24 pt-10 sm:pb-10">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold">{siteName}</p>
          <p className="mt-1 text-sm text-slate-500">© {new Date().getFullYear()} · Помощь студентам</p>
        </div>
        <WhatsAppButton numbers={numbers} mode={mode} />
      </div>
      <p className="mx-auto mt-8 max-w-5xl px-4 text-xs text-slate-400">
        Материалы предоставляются в качестве образца для самостоятельной подготовки.
      </p>
    </footer>
  );
}
