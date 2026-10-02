"use client";

import { MessageCircle } from "lucide-react";
import type { NumberMode, WhatsAppNumber } from "@/lib/types";
import { buildWaLink, pickNumber, openLink, QUICK_MESSAGE } from "@/lib/whatsapp";
import { reachGoal } from "@/lib/analytics";

interface Props {
  numbers: WhatsAppNumber[];
  mode: NumberMode;
  text?: string;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
}

/** Кнопка, которая открывает чат WhatsApp с выбранным менеджером. */
export function WhatsAppButton({ numbers, mode, text = QUICK_MESSAGE, className, children, ariaLabel }: Props) {
  const hasNumbers = numbers.some((n) => n.is_active);

  function handleClick() {
    const number = pickNumber(numbers, mode);
    if (!number) return;
    reachGoal("whatsapp_click");
    openLink(buildWaLink(number.phone, text));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hasNumbers}
      className={className ?? "btn-wa"}
      aria-label={ariaLabel}
      title={hasNumbers ? undefined : "Приём заявок временно приостановлен"}
    >
      {children ?? (
        <>
          <MessageCircle className="size-5" aria-hidden />
          Написать в WhatsApp
        </>
      )}
    </button>
  );
}
