import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";
import {
  Users,
  Search,
  History,
  TrendingUp,
  Building2,
  ChevronRight,
  Filter,
} from "lucide-react";

export default async function TOEConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; company?: string }>;
}) {
  const { query, company } = await searchParams;
  const { profile } = await getCurrentProfile();
  const tenantId = profile?.tenant_id;
  const adminSupabase = getServiceSupabase();

  // Fetch companies for the filter
  const { data: companies } = await adminSupabase
    .from("companies")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .order("name");

  // Fetch Workers with their cumulative doses
  let workersQuery = adminSupabase
    .from("toe_workers")
    .select(`
      id,
      first_name,
      last_name,
      ci,
      worker_code,
      companies!inner(name, tenant_id),
      doses(hp10, month, year, status)
    `)
    .eq("companies.tenant_id", tenantId);

  if (query) {
    workersQuery = workersQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,ci.ilike.%${query}%`);
  }
  if (company) {
    workersQuery = workersQuery.eq("company_id", company);
  }

  const { data: workers } = await workersQuery.limit(100);

  // Process workers to calculate totals
  const processedWorkers = workers?.map(w => {
    const approvedDoses = w.doses?.filter((d: any) => d.status === 'approved') || [];
    const totalDose = approvedDoses.reduce((acc: number, curr: any) => acc + (Number(curr.hp10) || 0), 0);
    const lastDose = approvedDoses.sort((a: any, b: any) => (b.year * 12 + b.month) - (a.year * 12 + a.month))[0];
    
    return {
      ...w,
      totalDose,
      lastDose: lastDose?.hp10 || 0,
      lastDate: lastDose ? `${lastDose.month}/${lastDose.year}` : 'N/A'
    };
  }) || [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
          Consulta de TOEs
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Búsqueda global y trazabilidad histórica de trabajadores ocupacionalmente expuestos.
        </p>
      </header>

      {/* SEARCH & FILTERS */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "flex-end" }}>
        <form style={{ flex: 1, display: "flex", gap: "1rem" }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Buscar por Nombre o CI</label>
            <div style={{ position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                name="query"
                defaultValue={query}
                placeholder="Ej: Juan Perez o 12.345.678" 
                style={{ ...inputStyle, paddingLeft: "3rem" }} 
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Filtrar por Empresa</label>
            <select name="company" defaultValue={company} style={inputStyle}>
              <option value="">Todas las Empresas</option>
              {companies?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: "48px", padding: "0 2rem" }}>
            <Filter size={18} /> Filtrar
          </button>
        </form>
      </div>

      {/* WORKERS TABLE */}
      <div className="clean-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(0,0,0,0.02)" }}>
            <tr>
              <th style={thStyle}>Trabajador</th>
              <th style={thStyle}>Identificación</th>
              <th style={thStyle}>Empresa / Código</th>
              <th style={thStyle}>Última Lectura</th>
              <th style={thStyle}>Dosis Acumulada</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {processedWorkers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <Users size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
                  <p>No se encontraron trabajadores con los criterios de búsqueda.</p>
                </td>
              </tr>
            ) : (
              processedWorkers.map((w) => (
                <tr key={w.id} className="table-row-hover" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 800, fontSize: "1rem" }}>{w.first_name} {w.last_name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{w.worker_code}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600 }}>{w.ci}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Building2 size={14} color="var(--primary-teal)" />
                      <span style={{ fontWeight: 600 }}>{(w.companies as any).name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 800, color: w.lastDose > 1.6 ? "var(--state-danger)" : "inherit" }}>
                      {w.lastDose.toFixed(3)} mSv
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{w.lastDate}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <TrendingUp size={16} color="var(--primary-teal)" />
                      <span style={{ fontWeight: 900, fontSize: "1.1rem" }}>{w.totalDose.toFixed(2)}</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>mSv</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <Link
                      href={`/lab/toe-consultation/${w.id}`}
                      className="btn"
                      style={{
                        flex: 1,
                        background: "rgba(6, 182, 212, 0.1)",
                        color: "var(--primary)",
                        justifyContent: "center",
                        fontSize: "0.875rem",
                        padding: "0.5rem 1rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                    >
                      <History size={14} /> Ver Historial
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
  padding: "1.25rem 1.5rem",
  textAlign: "left" as const,
  fontSize: "0.75rem",
  fontWeight: 800,
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
  letterSpacing: "0.05em",
};

const tdStyle = {
  padding: "1.25rem 1.5rem",
};

const labelStyle = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 900,
  color: "var(--text-muted)",
  textTransform: "uppercase" as const,
  marginBottom: "0.5rem",
};

const inputStyle = {
  width: "100%",
  height: "48px",
  padding: "0 1rem",
  background: "white",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "0.95rem",
  fontWeight: 600,
};
