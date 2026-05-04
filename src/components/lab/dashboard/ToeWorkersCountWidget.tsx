import { Users } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";

export default async function ToeWorkersCountWidget({ tenantId }: { tenantId: string }) {
  const adminSupabase = getServiceSupabase();
  
  const { count: workersCount = 0 } = await adminSupabase
    .from("toe_workers")
    .select("id, companies!inner(tenant_id)", { count: "exact", head: true })
    .eq("companies.tenant_id", tenantId);

  return (
    <div className="clean-panel">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Personal TOE</span>
        <Users size={18} color="var(--primary-teal)" />
      </div>
      <div style={{ fontSize: "2.25rem", fontWeight: 900 }}>{workersCount || 0}</div>
      <p style={{ fontSize: "0.75rem", color: "var(--state-safe)", marginTop: "0.5rem", fontWeight: 700 }}>● Vigilancia Activa</p>
    </div>
  );
}
