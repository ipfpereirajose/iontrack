import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";

export default async function RecentValidationsTable({ tenantId }: { tenantId: string }) {
  const adminSupabase = getServiceSupabase();
  
  const { data: pendingDoses = [] } = await adminSupabase
    .from("doses")
    .select("id, month, year, hp10, status, toe_workers!inner(first_name, last_name, ci, companies!inner(name, tenant_id))")
    .eq("status", "pending")
    .eq("toe_workers.companies.tenant_id", tenantId)
    .limit(10);

  return (
    <section style={{ marginTop: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Pendientes de Validación</h2>
        <Link href="/lab/validation" style={{ fontSize: "0.875rem", color: "var(--primary-teal)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>
      <div className="clean-panel" style={{ padding: "0", overflow: "hidden" }}>
        {!pendingDoses || pendingDoses.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
            <CheckCircle size={48} style={{ marginBottom: "1rem", opacity: 0.2 }} />
            <p style={{ fontWeight: 600 }}>No hay dosis pendientes. Todo al día.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Trabajador</th>
                <th>Institución</th>
                <th>Periodo</th>
                <th>Dosis</th>
                <th style={{ textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pendingDoses.map((dose: any) => (
                <tr key={dose.id}>
                  <td style={{ fontWeight: 700 }}>{dose.toe_workers.first_name} {dose.toe_workers.last_name}</td>
                  <td style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{dose.toe_workers.companies.name}</td>
                  <td style={{ fontSize: "0.875rem" }}>{dose.month}/{dose.year}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>{dose.hp10}</span>
                    <span style={{ fontSize: "0.7rem", marginLeft: "0.2rem", color: "var(--text-muted)" }}>mSv</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href="/lab/validation" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", borderRadius: "8px" }}>Gestionar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
