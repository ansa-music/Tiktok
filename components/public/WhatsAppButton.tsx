"use client";

import { MessageCircle } from "lucide-react";
import type { NumberMode, WhatsAppNumber } from "@/lib/types";
import { buildWaLink, pickNumber, openLink } from "@/lib/whatsapp";
import { reachGoal } from "@/lib/analytics";

interface Props {
  numbers: WhatsAppNumber[];
  mode: NumberMode;
  text: string;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
  pausedText?: string;
}

/** Кнопка, которая открывает чат WhatsApp с выбранным менеджером. */
export function WhatsAppButton({ numbers, mode, text, className, children, ariaLabel, pausedText }: Props) {
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
      className={className ?? "btn-glow"}
      aria-label={ariaLabel}
      title={hasNumbers ? undefined : pausedText}
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
