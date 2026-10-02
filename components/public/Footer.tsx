import { Zap } from "lucide-react";
import type { NumberMode, WhatsAppNumber } from "@/lib/types";
import type { SiteContent } from "@/lib/content";
import { WhatsAppButton } from "./WhatsAppButton";

interface Props {
  siteName: string;
  numbers: WhatsAppNumber[];
  mode: NumberMode;
  content: SiteContent["footer"];
  whatsapp: SiteContent["whatsapp"];
  pausedText: string;
}

export function Footer({ siteName, numbers, mode, content, whatsapp, pausedText }: Props) {
  return (
    <footer className="relative border-t border-white/10 pb-28 pt-10 sm:pb-10">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-wa/10 to-transparent" />
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display flex items-center gap-2 text-xl font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-wa to-lime text-ink">
              <Zap className="size-4" aria-hidden />
            </span>
            {siteName}
          </p>
          <p className="mt-1 text-sm text-white/50">© {new Date().getFullYear()}{content.tagline ? ` · ${content.tagline}` : ""}</p>
        </div>
        <WhatsAppButton numbers={numbers} mode={mode} text={whatsapp.quick_message} pausedText={pausedText} />
      </div>
      {content.disclaimer && <p className="mx-auto mt-8 max-w-5xl px-4 text-xs text-white/35">{content.disclaimer}</p>}
    </footer>
  );
}
