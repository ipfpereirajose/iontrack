import { getServiceSupabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import { 
  ShieldAlert, 
  ArrowLeft, 
  Calendar, 
  Building2, 
  User,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import YearSelector from "@/components/lab/YearSelector";

export default async function LabAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const { year: selectedYear } = await searchParams;
  const targetYear = selectedYear ? parseInt(selectedYear) : new Date().getFullYear();
  const tenantId = profile?.tenant_id;
  const adminSupabase = getServiceSupabase();

  // Fetch all overexposures for the tenant and year
  const { data: alerts } = await adminSupabase
    .from("doses")
    .select("id, hp10, month, year, status, toe_workers!inner(id, first_name, last_name, ci, companies!inner(name, tenant_id))")
    .eq("toe_workers.companies.tenant_id", tenantId)
    .eq("year", targetYear)
    .gte("hp10", 1.6)
    .order("hp10", { ascending: false });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <Link 
          href="/lab" 
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "1.5rem", fontSize: "0.875rem", fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
              Registro de Sobre-exposiciones
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Listado completo de incidencias detectadas que superan el umbral de seguridad (1.6 mSv).
            </p>
          </div>
          <YearSelector currentYear={targetYear} />
        </div>
      </header>

      <div className="clean-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(239, 68, 68, 0.05)" }}>
            <tr>
              <th style={thStyle}>Trabajador</th>
              <th style={thStyle}>Empresa</th>
              <th style={thStyle}>Periodo</th>
              <th style={thStyle}>Valor Hp(10)</th>
              <th style={thStyle}>Estatus</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!alerts || alerts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <ShieldAlert size={48} style={{ opacity: 0.1, marginBottom: "1rem" }} />
                  <p>No hay alertas registradas para el año {targetYear}.</p>
                </td>
              </tr>
            ) : (
              alerts.map((alert: any) => (
                <tr key={alert.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "32px", height: "32px", background: "rgba(0,0,0,0.05)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800 }}>{alert.toe_workers.first_name} {alert.toe_workers.last_name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>CI: {alert.toe_workers.ci}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                      <Building2 size={14} color="var(--text-muted)" />
                      {alert.toe_workers.companies.name}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {alert.month}/{alert.year}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                      <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--state-danger)" }}>{alert.hp10}</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>mSv</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span className="badge badge-danger" style={{ textTransform: "uppercase" }}>Sobre-exposición</span>
                  </td>
                  <td style={tdStyle}>
                    <Link 
                      href={`/lab/toe-consultation/${alert.toe_workers.id}`}
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                    >
                      <ExternalLink size={14} /> Ver Ficha
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
};
