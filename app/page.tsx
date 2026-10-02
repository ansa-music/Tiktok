import { getActiveFaq, getActiveNumbers, getActiveServices, getSettings } from "@/lib/data";
import { Hero } from "@/components/public/Hero";
import { Marquee } from "@/components/public/Marquee";
import { Services } from "@/components/public/Services";
import { OrderForm } from "@/components/public/OrderForm";
import { HowItWorks } from "@/components/public/HowItWorks";
import { Guarantees } from "@/components/public/Guarantees";
import { Faq } from "@/components/public/Faq";
import { Footer } from "@/components/public/Footer";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";
import { ScrollProgress } from "@/components/public/ScrollProgress";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, services, numbers, faq] = await Promise.all([
    getSettings(),
    getActiveServices(),
    getActiveNumbers(),
    getActiveFaq(),
  ]);
  const c = settings.content;

  return (
    <div id="top" className="overflow-x-clip">
      <ScrollProgress />
      <Hero siteName={settings.site_name} title={settings.hero_title} subtitle={settings.hero_subtitle} content={c.hero} highlights={services} />
      {c.marquee.enabled && <Marquee items={c.marquee.items} />}
      <main>
        {c.services.enabled && <Services services={services} content={c.services} />}
        <OrderForm services={services} numbers={numbers} numberMode={settings.number_mode} template={settings.message_template} content={c.order} />
        {c.how.enabled && <HowItWorks content={c.how} />}
        {c.guarantees.enabled && <Guarantees content={c.guarantees} />}
        {c.faq.enabled && <Faq items={faq} content={c.faq} />}
      </main>
      <Footer siteName={settings.site_name} numbers={numbers} mode={settings.number_mode} content={c.footer} whatsapp={c.whatsapp} pausedText={c.order.paused_text} />
      <FloatingWhatsApp numbers={numbers} mode={settings.number_mode} whatsapp={c.whatsapp} pausedText={c.order.paused_text} />
    </div>
  );
}
