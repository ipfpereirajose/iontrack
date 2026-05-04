import { ShieldAlert, ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";

export default async function CriticalNotificationsSidebar({ tenantId, targetYear }: { tenantId: string, targetYear: number }) {
  const adminSupabase = getServiceSupabase();
  
  const { data: criticalDoses = [] } = await adminSupabase
    .from("doses")
    .select("id, hp10, month, year, status, toe_workers!inner(id, first_name, last_name, companies!inner(name, tenant_id))")
    .eq("toe_workers.companies.tenant_id", tenantId)
    .eq("year", targetYear)
    .gte("hp10", 1.6)
    .order("hp10", { ascending: false })
    .limit(10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.1rem", fontWeight: 800 }}>
            <ShieldAlert size={20} color="var(--state-danger)" />
            Notificaciones Críticas
          </h3>
          <Link href={`/lab/alerts?year=${targetYear}`} style={{ fontSize: "0.8rem", color: "var(--primary-teal)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            Ver Todas <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!criticalDoses || criticalDoses.length === 0 ? (
            <div className="clean-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No hay alertas registradas.
            </div>
          ) : (
            criticalDoses.map((alert: any) => (
              <div key={alert.id} className="clean-panel" style={{ padding: "1rem", borderLeft: `4px solid var(--state-danger)`, background: "rgba(239, 68, 68, 0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--state-danger)" }}>SOBRE-EXPOSICIÓN</span>
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
