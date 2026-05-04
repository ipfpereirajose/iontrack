import { Users, Building2, TrendingUp, History } from "lucide-react";
import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";
import RegisterDoseModal from "@/components/lab/RegisterDoseModal";

export default async function ToeWorkersList({ tenantId, query, company }: { tenantId: string, query?: string, company?: string }) {
  const adminSupabase = getServiceSupabase();
  
  let workersQuery = adminSupabase
    .from("toe_workers")
    .select(`
      id,
      first_name,
      last_name,
      ci,
      worker_code,
      company_id,
      companies!inner(name, tenant_id),
      doses(hp10, hp3, hp007, hp007_ext, hp10_neu, month, year, status)
    `)
    .eq("companies.tenant_id", tenantId);

  if (query) {
    const cleanQuery = query.replace(/\./g, "").replace(/\s/g, "");
    workersQuery = workersQuery.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,ci.ilike.%${query}%,ci.ilike.%${cleanQuery}%`
    );
  }
  if (company) {
    workersQuery = workersQuery.eq("company_id", company);
  }

  const { data: workers, error: fetchError } = await workersQuery.limit(100);

  if (fetchError) {
    console.error("Error fetching workers:", fetchError);
    return (
      <div className="clean-panel" style={{ padding: "4rem", textAlign: "center", color: "var(--state-danger)" }}>
        <p>Error al cargar trabajadores: {fetchError.message}</p>
      </div>
    );
  }

  const processedWorkers = workers?.map(w => {
    // Handle potential array/object return from join
    const company = Array.isArray(w.companies) ? w.companies[0] : w.companies;
    const approvedDoses = w.doses?.filter((d: any) => d.status === 'approved') || [];
    
    const totals = {
      hp10: approvedDoses.reduce((acc: number, curr: any) => acc + (Number(curr.hp10) || 0), 0),
      hp3: approvedDoses.reduce((acc: number, curr: any) => acc + (Number(curr.hp3) || 0), 0),
      hp007: approvedDoses.reduce((acc: number, curr: any) => acc + (Number(curr.hp007) || 0), 0),
      hp007_ext: approvedDoses.reduce((acc: number, curr: any) => acc + (Number(curr.hp007_ext) || 0), 0),
      hp10_neu: approvedDoses.reduce((acc: number, curr: any) => acc + (Number(curr.hp10_neu) || 0), 0),
    };

    const lastDose = approvedDoses.sort((a: any, b: any) => (b.year * 12 + b.month) - (a.year * 12 + a.month))[0];
    
    return {
      ...w,
      company: company || { name: 'S/N' },
      totals,
      lastDose: lastDose?.hp10 || 0,
      lastDate: lastDose ? `${lastDose.month}/${lastDose.year}` : 'N/A'
    };
  }) || [];

  return (
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
                    <span style={{ fontWeight: 600 }}>{w.company.name}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 800, color: w.lastDose > 1.6 ? "var(--state-danger)" : "inherit" }}>
                    {w.lastDose.toFixed(3)} mSv
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{w.lastDate}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <TrendingUp size={16} color="var(--primary-teal)" />
                      <span style={{ fontWeight: 900, fontSize: "1.1rem" }}>{w.totals.hp10.toFixed(2)}</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Hp(10)</span>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <div style={miniDoseStyle}>
                        <span style={miniDoseLabel}>Hp(3):</span>
                        <span>{w.totals.hp3.toFixed(2)}</span>
                      </div>
                      <div style={miniDoseStyle}>
                        <span style={miniDoseLabel}>Hp(0.07):</span>
                        <span>{w.totals.hp007.toFixed(2)}</span>
                      </div>
                      <div style={miniDoseStyle}>
                        <span style={miniDoseLabel}>Ext:</span>
                        <span>{w.totals.hp007_ext.toFixed(2)}</span>
                      </div>
                      <div style={miniDoseStyle}>
                        <span style={miniDoseLabel}>Neu:</span>
                        <span>{w.totals.hp10_neu.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link
                      href={`/lab/toe-consultation/${w.id}`}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        padding: "0.5rem"
                      }}
                    >
                      <History size={14} /> Historial
                    </Link>
                    
                    <RegisterDoseModal 
                      workerId={w.id} 
                      workerName={`${w.first_name} ${w.last_name}`}
                      companyName={w.company.name}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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

const miniDoseStyle = {
  fontSize: "0.65rem",
  fontWeight: 700,
  color: "var(--text-main)",
  display: "flex",
  justifyContent: "space-between",
  padding: "0.2rem 0.4rem",
  background: "rgba(0,0,0,0.03)",
  borderRadius: "4px"
};

const miniDoseLabel = {
  color: "var(--text-muted)",
  marginRight: "0.25rem"
};
