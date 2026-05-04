import { ShieldAlert, ArrowRight, Download, FileText } from "lucide-react";
import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";

export default async function CriticalNotificationsSidebar({ tenantId, targetYear }: { tenantId: string, targetYear: number }) {
  const adminSupabase = getServiceSupabase();
  
  const { data: openIncidents = [] } = await adminSupabase
    .from("incidents")
    .select(`
      id,
      status,
      doses!inner(id, hp10, month, year),
      toe_workers!inner(id, first_name, last_name, companies!inner(name))
    `)
    .eq("tenant_id", tenantId)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(10);

  // Map the incidents back to the format expected by the render logic
  const criticalDoses = (openIncidents || []).map((inc: any) => ({
    id: inc.doses.id,
    hp10: inc.doses.hp10,
    month: inc.doses.month,
    year: inc.doses.year,
    toe_workers: inc.toe_workers
  }));

  const { data: closedIncidents = [] } = await adminSupabase
    .from("incidents")
    .select(`
      id,
      status,
      corrective_action_text,
      closed_at,
      doses!inner(id, hp10, month, year),
      toe_workers!inner(id, first_name, last_name, companies!inner(name))
    `)
    .eq("tenant_id", tenantId)
    .eq("status", "closed")
    .order("closed_at", { ascending: false })
    .limit(5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* ACTIVE ALERTS */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.1rem", fontWeight: 800 }}>
            <ShieldAlert size={20} color="var(--state-danger)" />
            Alertas y Advertencias
          </h3>
          <Link href={`/lab/alerts?year=${targetYear}`} style={{ fontSize: "0.8rem", color: "var(--primary-teal)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            Ver Todas <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!criticalDoses || criticalDoses.length === 0 ? (
            <div className="clean-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No hay alertas activas.
            </div>
          ) : (
            criticalDoses.map((alert: any) => (
              <div key={alert.id} className="clean-panel" style={{ 
                padding: "1rem", 
                borderLeft: `4px solid ${alert.hp10 >= 1.66 ? "var(--state-danger)" : "var(--state-warning, #f59e0b)"}`, 
                background: alert.hp10 >= 1.66 ? "rgba(239, 68, 68, 0.05)" : "rgba(245, 158, 11, 0.05)" 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 900, color: alert.hp10 >= 1.66 ? "var(--state-danger)" : "#f59e0b" }}>
                    {alert.hp10 >= 1.66 ? "SOBRE-EXPOSICIÓN" : "ADVERTENCIA 80%"}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{alert.month}/{alert.year}</span>
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700 }}>{alert.toe_workers.first_name} {alert.toe_workers.last_name}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{alert.toe_workers.companies.name}</p>
                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: 900 }}>{alert.hp10}</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)" }}>mSv</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* RESOLVED JUSTIFICATIONS */}
      <section>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.1rem", fontWeight: 800, marginBottom: "1.25rem" }}>
          <FileText size={20} color="var(--state-safe)" />
          Justificaciones de Clínicas
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!closedIncidents || closedIncidents.length === 0 ? (
            <div className="clean-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", background: "rgba(255,255,255,0.02)" }}>
              No hay justificaciones recientes.
            </div>
          ) : (
            closedIncidents.map((inc: any) => (
              <div key={inc.id} className="clean-panel" style={{ 
                padding: "1rem", 
                borderLeft: "4px solid var(--state-safe)", 
                background: "rgba(16, 185, 129, 0.05)" 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--state-safe)" }}>TICKET CERRADO</span>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    {new Date(inc.closed_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>{inc.toe_workers.first_name} {inc.toe_workers.last_name}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{inc.toe_workers.companies.name}</p>
                <div style={{ 
                  background: "white", 
                  padding: "0.6rem", 
                  borderRadius: "4px", 
                  fontSize: "0.75rem", 
                  border: "1px solid var(--border)",
                  fontStyle: "italic",
                  lineHeight: "1.4"
                }}>
                  "{inc.corrective_action_text}"
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* AGENT DOWNLOAD */}
      <div className="clean-panel" style={{ background: "var(--primary-dark)", color: "white", border: "none" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "0.5rem" }}>Agente de Ingesta</h3>
        <p style={{ fontSize: "0.8rem", opacity: 0.9, marginBottom: "1.25rem", fontWeight: 600 }}>Descarga la última versión para sincronización offline.</p>
        <Link href="/downloads/iontrack-agent.exe" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          <Download size={18} /> Descargar Agente
        </Link>
      </div>
    </div>
  );
}
