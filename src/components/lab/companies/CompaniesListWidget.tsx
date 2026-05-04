import { Building2, Plus, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";
import CompanyExportButton from "@/components/lab/CompanyExportButton";

export default async function CompaniesListWidget({ tenantId }: { tenantId: string }) {
  const adminSupabase = getServiceSupabase();
  
  const { data: companies } = await adminSupabase
    .from("companies")
    .select("*, toe_workers(id)")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Building2 size={24} color="var(--primary)" /> Registro de Empresas
        </h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <CompanyExportButton companies={companies || []} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {!companies || companies.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "5rem", background: "rgba(255,255,255,0.02)" }}>
            <Building2 size={64} color="var(--text-muted)" style={{ marginBottom: "1.5rem", opacity: 0.2 }} />
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Sin empresas registradas</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Comienza registrando tu primera empresa cliente.</p>
            <Link href="/lab/companies/new" className="btn btn-primary">Registrar Empresa</Link>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ background: "rgba(6, 182, 212, 0.1)", padding: "0.6rem", borderRadius: "10px", color: "var(--primary)" }}>
                  <Building2 size={20} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>ID Único</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 900, color: "var(--primary-teal)" }}>{company.company_code}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600 }}>RIF: {company.tax_id}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem" }}>{company.name}</h3>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Users size={12} /> {Array.isArray(company.toe_workers) ? company.toe_workers.length : 0} TOEs
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Calendar size={12} /> {company.sector || "General"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                <Link href={`/lab/companies/${company.id}/workers`} className="btn" style={{ flex: 1, background: "rgba(255,255,255,0.05)", justifyContent: "center", fontSize: "0.8rem", padding: "0.5rem" }}>Trabajadores</Link>
                <Link href={`/lab/companies/${company.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem", padding: "0.5rem" }}>Ver Detalles</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
