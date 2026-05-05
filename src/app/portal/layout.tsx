import Sidebar from "@/components/portal/Sidebar";
import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServiceSupabase } from "@/lib/supabase";

export const metadata = {
  title: "I.O.N.T.R.A.C.K. | Portal Empresas",
  description: "Portal de Auto-Servicio para Empresas Clientes de Dosimetría",
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getCurrentProfile();
  
  // 1. If no user, let them see login (handled by middleware)
  if (!user) return <>{children}</>;

  // 2. Critical Security Check: Ensure user is a company manager
  if (profile?.role !== "company_manager") {
    if (profile?.role === "lab_admin" || profile?.role === "lab_tech") redirect("/lab");
    if (profile?.role === "superadmin") redirect("/admin");
    redirect("/");
  }

  const supabase = getServiceSupabase();
  // Fetch tenant info via company
  const { data: company } = await supabase
    .from("companies")
    .select("tenant_id")
    .eq("id", profile.company_id)
    .single();

  let logoUrl = null;
  if (company?.tenant_id) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("logo_url")
      .eq("id", company.tenant_id)
      .single();
    logoUrl = tenant?.logo_url;
  }

  const showSidebar = true;

  return (
    <div
      className="dashboard-layout"
      style={{ 
        "--primary": "var(--color-portal)",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        minHeight: "100vh"
      } as any}
    >
      <Sidebar logoUrl={logoUrl} />
      <main className="main-content">{children}</main>
    </div>
  );
}
