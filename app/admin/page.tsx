import { requireAdmin } from "@/lib/auth";
import { getAllFaq, getAllNumbers, getAllServices, getSettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AdminDashboard, type TabKey } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

const TABS: TabKey[] = ["services", "numbers", "texts", "faq"];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const { tab } = await searchParams;
  const initialTab = TABS.includes(tab as TabKey) ? (tab as TabKey) : "services";

  const [settings, services, numbers, faq] = await Promise.all([
    getSettings(),
    getAllServices(),
    getAllNumbers(),
    getAllFaq(),
  ]);

  return (
    <AdminDashboard
      initialTab={initialTab}
      settings={settings}
      services={services}
      numbers={numbers}
      faq={faq}
      isMock={!isSupabaseConfigured()}
    />
  );
}
