import { ShieldAlert } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";

export default async function CriticalAlertsListWidget({ tenantId }: { tenantId: string }) {
  const adminSupabase = getServiceSupabase();
  
  const { data: alerts } = await adminSupabase
    .from("doses")
    .select(`
      id, hp10, month, year, status,
      toe_workers!inner (
        first_name, last_name,
        companies!inner (name, tenant_id)
      )
    `)
    .eq("toe_workers.companies.tenant_id", tenantId)
    .gte("hp10", 1.328)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="clean-panel">
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.1rem", fontWeight: 800, marginBottom: "1.5rem" }}>
        <ShieldAlert size={20} color="#f87171" /> Alertas Críticas
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {!alerts || alerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "0.875rem" }}>No se han detectado sobre-exposiciones.</p>
          </div>
        ) : (
          alerts.map((alert: any) => (
            <div key={alert.id} style={{ background: alert.hp10 >= 1.66 ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)", borderLeft: `4px solid ${alert.hp10 >= 1.66 ? "#ef4444" : "#f59e0b"}`, padding: "1rem", borderRadius: "0 12px 12px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: 800, fontSize: "0.9rem", color: alert.hp10 >= 1.66 ? "#f87171" : "#fbbf24" }}>
                  {alert.hp10 >= 1.66 ? "SOBRE-EXPOSICIÓN" : "ADVERTENCIA 80%"}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{alert.month}/{alert.year}</span>
              </div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0.25rem 0" }}>{alert.toe_workers.first_name} {alert.toe_workers.last_name}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{alert.toe_workers.companies.name}</p>
              <div style={{ marginTop: "0.5rem", fontWeight: 900, fontSize: "1.1rem" }}>{alert.hp10} <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>mSv</span></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
