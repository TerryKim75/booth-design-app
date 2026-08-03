import { requireClient } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/portal/portal-header";

export const metadata = { title: "고객사 포털", robots: { index: false } };

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireClient();

  const supabase = await createServerSupabaseClient();
  const { data: client } = await supabase
    .from("clients")
    .select("company_name")
    .eq("id", profile.clientId)
    .single();

  return (
    <div className="min-h-screen bg-aso-offwhite">
      <PortalHeader companyName={client?.company_name ?? profile.name} />
      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
