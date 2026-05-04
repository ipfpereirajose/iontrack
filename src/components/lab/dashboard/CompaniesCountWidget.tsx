import { Building2 } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";

export default async function CompaniesCountWidget({ tenantId }: { tenantId: string }) {
  const adminSupabase = getServiceSupabase();
  
  const { count: companiesCount = 0 } = await adminSupabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId);

  return (
    <div className="clean-panel">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Empresas</span>
        <Building2 size={18} color="var(--primary-teal)" />
      </div>
      <div style={{ fontSize: "2.25rem", fontWeight: 900 }}>{companiesCount || 0}</div>
      <p style={{ fontSize: "0.75rem", color: "var(--state-safe)", marginTop: "0.5rem", fontWeight: 700 }}>● Clientes Activos</p>
    </div>
  );
}
