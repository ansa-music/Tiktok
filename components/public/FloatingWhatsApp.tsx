"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { NumberMode, WhatsAppNumber } from "@/lib/types";
import type { SiteContent } from "@/lib/content";
import { WhatsAppButton } from "./WhatsAppButton";

interface Props {
  numbers: WhatsAppNumber[];
  mode: NumberMode;
  whatsapp: SiteContent["whatsapp"];
  pausedText: string;
}

/**
 * На телефоне — нижняя панель с кнопкой (появляется после прокрутки первого экрана,
 * прячется, пока на экране форма заявки). На десктопе — плавающая кнопка справа внизу.
 */
export function FloatingWhatsApp({ numbers, mode, whatsapp, pausedText }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const form = document.getElementById("order");
    let io: IntersectionObserver | undefined;
    if (form && "IntersectionObserver" in window) {
      io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.25 });
      io.observe(form);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  if (!numbers.some((n) => n.is_active)) return null;
  const show = scrolled && !formVisible;

  return (
    <>
      {/* мобильная нижняя панель */}
      <div
        className={`fixed inset-x-3 bottom-3 z-50 transition duration-300 sm:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <WhatsAppButton numbers={numbers} mode={mode} text={whatsapp.quick_message} pausedText={pausedText} className="btn-glow w-full text-base">
          <MessageCircle className="size-5" aria-hidden />
          {whatsapp.floating_label}
        </WhatsAppButton>
      </div>

      {/* десктопная плавающая кнопка */}
      <div className={`fixed bottom-6 right-6 z-50 hidden transition duration-300 sm:block ${scrolled ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        <span aria-hidden className="absolute inset-0 rounded-2xl bg-wa/60 animate-ping-slow" />
        <WhatsAppButton numbers={numbers} mode={mode} text={whatsapp.quick_message} pausedText={pausedText} ariaLabel={whatsapp.floating_label} className="btn-glow relative px-5">
          <MessageCircle className="size-6" aria-hidden />
          {whatsapp.floating_label}
        </WhatsAppButton>
      </div>
    </>
  );
}
