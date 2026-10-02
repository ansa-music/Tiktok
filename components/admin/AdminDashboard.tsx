"use client";

import { useState } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import type { Faq, Service, Settings, WhatsAppNumber } from "@/lib/types";
import { logout } from "@/app/admin/actions";
import { ToastProvider } from "./Toast";
import { ServicesTable } from "./ServicesTable";
import { NumbersTable } from "./NumbersTable";
import { SettingsForm } from "./SettingsForm";
import { FaqTable } from "./FaqTable";

export type TabKey = "services" | "numbers" | "texts" | "faq";

const TABS: { key: TabKey; label: string }[] = [
  { key: "services", label: "Цены и услуги" },
  { key: "numbers", label: "WhatsApp номера" },
  { key: "texts", label: "Тексты" },
  { key: "faq", label: "FAQ" },
];

interface Props {
  initialTab: TabKey;
  settings: Settings;
  services: Service[];
  numbers: WhatsAppNumber[];
  faq: Faq[];
  isMock: boolean;
}

export function AdminDashboard({ initialTab, settings, services, numbers, faq, isMock }: Props) {
  const [tab, setTab] = useState<TabKey>(initialTab);

  function switchTab(key: TabKey) {
    setTab(key);
    window.history.replaceState(null, "", `/admin?tab=${key}`);
  }

  return (
    <ToastProvider>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <span className="font-bold">{settings.site_name}</span>
            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">админ</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
              <ExternalLink className="size-4" aria-hidden />
              <span className="hidden sm:inline">Открыть сайт</span>
            </a>
            <form action={logout}>
              <button type="submit" className="btn-ghost btn-sm">
                <LogOut className="size-4" aria-hidden />
                Выйти
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto max-w-5xl overflow-x-auto px-4" aria-label="Разделы">
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => switchTab(t.key)}
                aria-current={tab === t.key ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${
                  tab === t.key ? "border-wa text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {isMock && (
          <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Supabase не настроен — данные хранятся в памяти и сбросятся при перезапуске сервера. Заполните переменные окружения, чтобы изменения сохранялись.
          </p>
        )}
        {tab === "services" && <ServicesTable services={services} />}
        {tab === "numbers" && <NumbersTable numbers={numbers} mode={settings.number_mode} />}
        {tab === "texts" && <SettingsForm settings={settings} />}
        {tab === "faq" && <FaqTable items={faq} />}
      </main>
    </ToastProvider>
  );
}
