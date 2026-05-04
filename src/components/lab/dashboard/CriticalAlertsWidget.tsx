import { AlertTriangle } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";

export default async function CriticalAlertsWidget({ tenantId, targetYear }: { tenantId: string, targetYear: number }) {
  const adminSupabase = getServiceSupabase();
  
  const { count: criticalCount = 0 } = await adminSupabase
    .from("incidents")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "open");

  return (
    <div className="clean-panel" style={{ borderLeft: `4px solid ${criticalCount && criticalCount > 0 ? "var(--state-danger)" : "var(--state-safe)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Alertas Críticas</span>
        <AlertTriangle size={18} color={criticalCount && criticalCount > 0 ? "var(--state-danger)" : "var(--text-muted)"} />
      </div>
      <div style={{ fontSize: "2.25rem", fontWeight: 900, color: criticalCount && criticalCount > 0 ? "var(--state-danger)" : "inherit" }}>{criticalCount || 0}</div>
      <p style={{ fontSize: "0.75rem", color: criticalCount && criticalCount > 0 ? "var(--state-danger)" : "var(--state-safe)", marginTop: "0.5rem", fontWeight: 700 }}>
        {criticalCount && criticalCount > 0 ? "🚨 Sobre-exposición" : "✓ Sin incidencias"}
      </p>
    </div>
  );
}
