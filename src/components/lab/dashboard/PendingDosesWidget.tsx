import { getServiceSupabase } from "@/lib/supabase";

export default async function PendingDosesWidget({ tenantId }: { tenantId: string }) {
  const adminSupabase = getServiceSupabase();
  
  const { count: pendingCount = 0 } = await adminSupabase
    .from("doses")
    .select("id, toe_workers!inner(companies!inner(tenant_id))", { count: "exact", head: true })
    .eq("status", "pending")
    .eq("toe_workers.companies.tenant_id", tenantId);

  return (
    <div className="clean-panel">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Pendientes</span>
        <div style={{ background: "var(--state-warning)", color: "white", padding: "0.25rem 0.5rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 900 }}>ACCION</div>
      </div>
      <div style={{ fontSize: "2.25rem", fontWeight: 900 }}>{pendingCount || 0}</div>
      <p style={{ fontSize: "0.75rem", color: pendingCount && pendingCount > 0 ? "var(--state-warning)" : "var(--state-safe)", marginTop: "0.5rem", fontWeight: 700 }}>
        {pendingCount && pendingCount > 0 ? "⚠️ Acción Requerida" : "✓ Al día"}
      </p>
    </div>
  );
}
