import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";
import { Metrika } from "@/components/public/Metrika";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["500", "700", "900"], variable: "--font-unbounded", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#070b09",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => null);
  const siteName = s?.site_name ?? "StudHelp";
  const title = `${siteName} — курсовые, дипломы, рефераты и презентации на заказ`;
  const description =
    s?.hero_subtitle ??
    "Помощь студентам: конспекты, рефераты, курсовые, дипломные и презентации. Оценим стоимость за 15 минут в WhatsApp.";
  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    applicationName: siteName,
    openGraph: { title, description, siteName, locale: "ru_RU", type: "website", url: "/" },
    twitter: { card: "summary", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings().catch(() => null);
  const metrikaId = settings?.yandex_metrika_id?.trim() || null;

  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <body className="min-h-dvh font-sans">
        {children}
        {metrikaId && <Metrika id={metrikaId} />}
      </body>
    </html>
  );
}
