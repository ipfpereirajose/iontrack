import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  History,
  TrendingUp,
  AlertTriangle,
  Building2,
  Calendar,
} from "lucide-react";
import DoseChart from "@/components/lab/DoseChart";

export default async function WorkerHistoryPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: workerId } = await params;
  const { profile } = await getCurrentProfile();
  const tenantId = profile?.tenant_id;
  const adminSupabase = getServiceSupabase();

  // Fetch Worker Info
  const { data: worker } = await adminSupabase
    .from("toe_workers")
    .select(`
      *,
      companies!inner(name, tenant_id, company_code)
    `)
    .eq("id", workerId)
    .eq("companies.tenant_id", tenantId)
    .single();

  if (!worker) return <div style={{ color: "white", padding: "2rem" }}>Trabajador no encontrado o no autorizado.</div>;

  // Fetch Dose History (all approved and pending)
  const { data: doses } = await adminSupabase
    .from("doses")
    .select("*")
    .eq("toe_worker_id", workerId)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  // Process data for Chart (last 12 reports)
  const chartData = (doses || [])
    .slice(0, 12)
    .reverse()
    .map(d => ({
      name: `${d.month}/${d.year}`,
      approved: d.status === 'approved' ? d.hp10 : 0,
      pending: d.status === 'pending' ? d.hp10 : 0,
      projected: 0
    }));

  const totalDose = (doses || [])
    .filter(d => d.status === 'approved')
    .reduce((acc, curr) => acc + (Number(curr.hp10) || 0), 0);

  const atRisk = totalDose > 18; // Example threshold for annual risk

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <Link
          href="/lab/toe-consultation"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          <ArrowLeft size={18} />
          Volver a Consulta Global
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
              {worker.first_name} {worker.last_name}
            </h1>
            <div style={{ display: "flex", gap: "1.5rem", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <User size={16} /> CI: {worker.ci}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Building2 size={16} /> {worker.companies.name}
              </span>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: "1rem 2rem", textAlign: "right" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)" }}>
              Dosis Total Acumulada
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: atRisk ? "var(--state-danger)" : "var(--primary-teal)" }}>
              {totalDose.toFixed(2)} <span style={{ fontSize: "1rem" }}>mSv</span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div className="clean-panel" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={20} color="var(--primary-teal)" />
            Historial Dosimétrico (Últimos 12 Reportes)
          </h3>
          <div style={{ height: "300px" }}>
            <DoseChart data={chartData} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="clean-panel" style={{ background: atRisk ? "rgba(239, 68, 68, 0.05)" : "rgba(0, 168, 181, 0.05)" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <AlertTriangle size={18} color={atRisk ? "var(--state-danger)" : "var(--primary-teal)"} />
                    Estado de Vigilancia
                </h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    {atRisk 
                        ? "ALERTA: El trabajador está cerca del límite anual de 20 mSv. Se recomienda rotación de puesto."
                        : "El trabajador se encuentra dentro de los límites operacionales normales."}
                </p>
            </div>

            <div className="clean-panel">
                <h4 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "1rem" }}>Datos de Registro</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={detailRow}>
                        <span>Código TOE:</span>
                        <strong style={{ color: "var(--primary-teal)" }}>{worker.worker_code}</strong>
                    </div>
                    <div style={detailRow}>
                        <span>Cargo:</span>
                        <strong>{worker.position || 'N/A'}</strong>
                    </div>
                    <div style={detailRow}>
                        <span>Práctica:</span>
                        <strong>{worker.practice || 'N/A'}</strong>
                    </div>
                    <div style={detailRow}>
                        <span>Género:</span>
                        <strong>{worker.sex === 'M' ? 'Masculino' : 'Femenino'}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div className="clean-panel" style={{ gridColumn: "1 / -1", padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%" }}>
                <thead style={{ background: "rgba(0,0,0,0.02)" }}>
                    <tr>
                        <th style={thStyle}>Periodo</th>
                        <th style={thStyle}>Hp10 (Profunda)</th>
                        <th style={thStyle}>Hp0.07 (Piel)</th>
                        <th style={thStyle}>Hp3 (Cristalino)</th>
                        <th style={thStyle}>Estado</th>
                        <th style={thStyle}>Fecha Registro</th>
                    </tr>
                </thead>
                <tbody>
                    {doses?.map(d => (
                        <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={tdStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <Calendar size={14} color="var(--text-muted)" />
                                    <strong>{d.month}/{d.year}</strong>
                                </div>
                            </td>
                            <td style={tdStyle}>
                                <span style={{ fontWeight: 900, color: d.hp10 > 1.6 ? "var(--state-danger)" : "inherit" }}>
                                    {d.hp10.toFixed(3)} mSv
                                </span>
                            </td>
                            <td style={tdStyle}>{d.hp007?.toFixed(3) || "0.000"}</td>
                            <td style={tdStyle}>{d.hp3?.toFixed(3) || "0.000"}</td>
                            <td style={tdStyle}>
                                <span style={{ 
                                    fontSize: "0.7rem", 
                                    fontWeight: 800, 
                                    padding: "0.25rem 0.5rem", 
                                    borderRadius: "4px",
                                    background: d.status === 'approved' ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                    color: d.status === 'approved' ? "var(--state-safe)" : "var(--state-warning)"
                                }}>
                                    {d.status === 'approved' ? 'APROBADO' : 'PENDIENTE'}
                                </span>
                            </td>
                            <td style={tdStyle}>
                                {new Date(d.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

const detailRow = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "0.5rem",
};

const thStyle = {
    padding: "1rem 1.5rem",
    textAlign: "left" as const,
    fontSize: "0.7rem",
    fontWeight: 800,
    textTransform: "uppercase" as const,
    color: "var(--text-muted)",
};

const tdStyle = {
    padding: "1rem 1.5rem",
    fontSize: "0.9rem",
};
