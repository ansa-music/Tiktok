import { MessageCircle } from "lucide-react";
import type { NumberMode, WhatsAppNumber } from "@/lib/types";
import { WhatsAppButton } from "./WhatsAppButton";

export function FloatingWhatsApp({ numbers, mode }: { numbers: WhatsAppNumber[]; mode: NumberMode }) {
  if (!numbers.some((n) => n.is_active)) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <WhatsAppButton
        numbers={numbers}
        mode={mode}
        ariaLabel="Написать в WhatsApp"
        className="btn-wa size-14 rounded-full p-0 shadow-xl shadow-wa/40 sm:h-14 sm:w-auto sm:px-5"
      >
        <MessageCircle className="size-7" aria-hidden />
        <span className="hidden sm:inline">Написать</span>
      </WhatsAppButton>
    </div>
  );
}
