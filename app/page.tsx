import { getActiveFaq, getActiveNumbers, getActiveServices, getSettings } from "@/lib/data";
import { Hero } from "@/components/public/Hero";
import { Services } from "@/components/public/Services";
import { OrderForm } from "@/components/public/OrderForm";
import { HowItWorks } from "@/components/public/HowItWorks";
import { Guarantees } from "@/components/public/Guarantees";
import { Faq } from "@/components/public/Faq";
import { Footer } from "@/components/public/Footer";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, services, numbers, faq] = await Promise.all([
    getSettings(),
    getActiveServices(),
    getActiveNumbers(),
    getActiveFaq(),
  ]);

  return (
    <div id="top">
      <Hero siteName={settings.site_name} title={settings.hero_title} subtitle={settings.hero_subtitle} />
      <main>
        <Services services={services} />
        <OrderForm services={services} numbers={numbers} numberMode={settings.number_mode} template={settings.message_template} />
        <HowItWorks />
        <Guarantees />
        <Faq items={faq} />
      </main>
      <Footer siteName={settings.site_name} numbers={numbers} mode={settings.number_mode} />
      <FloatingWhatsApp numbers={numbers} mode={settings.number_mode} />
    </div>
  );
}
