import { getServiceSupabase } from "@/lib/supabase";
import InteractiveCompanyTrendChart from "@/components/lab/InteractiveCompanyTrendChart";
import YearSelector from "@/components/lab/YearSelector";
import CompanyExportButton from "@/components/lab/CompanyExportButton";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { 
  Building2, 
  Plus, 
  ShieldAlert, 
  TrendingUp,
  Calendar,
  ArrowRight
} from "lucide-react";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: selectedYear = new Date().getFullYear().toString() } =
    await searchParams;
  const adminSupabase = getServiceSupabase();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const tenantId = profile?.tenant_id;
  if (!tenantId)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        No tienes un laboratorio asignado.
      </div>
    );

  // 1. Fetch Companies
  const companiesQuery = adminSupabase
    .from("companies")
    .select("*, toe_workers(count, id)")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  // 2. Fetch Alerts (Overexposure > 1.66 or Warning >= 1.328)
  const alertsQuery = adminSupabase
    .from("doses")
    .select(
      `
      id, hp10, month, year, status,
      toe_workers!inner (
        first_name, last_name,
        companies!inner (name, tenant_id)
      )
    `,
    )
    .eq("toe_workers.companies.tenant_id", tenantId)
    .gte("hp10", 1.328)
    .order("created_at", { ascending: false })
    .limit(5);

  const [{ data: companies }, { data: alerts }] =
    await Promise.all([companiesQuery, alertsQuery]);

  // Extract workerIds for the chart
  const workerIds = (companies || []).flatMap(c => (c.toe_workers || []).map((w: any) => w.id));

  const targetYear = parseInt(selectedYear);

  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
            }}
          >
            Dashboard de Empresas
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Monitoreo dosimétrico y gestión de entidades clientes.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <YearSelector currentYear={targetYear} />
          <CompanyExportButton companies={companies || []} />
          <Link
            href="/lab/companies/new"
            className="btn btn-primary"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Plus size={18} />
            Nueva Empresa
          </Link>
        </div>
      </header>

      {/* CHART SECTION */}
      <div style={{ marginBottom: "2.5rem" }}>
        <InteractiveCompanyTrendChart workerIds={workerIds} targetYear={targetYear} />
      </div>

      {/* SUMMARY AND ALERTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        {/* ALERTS SECTION */}
        <div className="clean-panel">
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "1.1rem",
              fontWeight: 800,
              marginBottom: "1.5rem",
            }}
          >
            <ShieldAlert size={20} color="#f87171" />
            Alertas Críticas
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {!alerts || alerts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "var(--text-muted)",
                }}
              >
                <p style={{ fontSize: "0.875rem" }}>
                  No se han detectado sobre-exposiciones en este periodo.
                </p>
              </div>
            ) : (
              alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  style={{
                    background:
                      alert.hp10 >= 1.66
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(245, 158, 11, 0.1)",
                    borderLeft: `4px solid ${alert.hp10 >= 1.66 ? "#ef4444" : "#f59e0b"}`,
                    padding: "1rem",
                    borderRadius: "0 12px 12px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        color: alert.hp10 >= 1.66 ? "#f87171" : "#fbbf24",
                      }}
                    >
                      {alert.hp10 >= 1.66
                        ? "SOBRE-EXPOSICIÓN"
                        : "ADVERTENCIA 80%"}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {alert.month}/{alert.year}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      margin: "0.25rem 0",
                    }}
                  >
                    {alert.toe_workers.first_name} {alert.toe_workers.last_name}
                  </p>
                  <p
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    {alert.toe_workers.companies.name}
                  </p>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontWeight: 900,
                      fontSize: "1.1rem",
                    }}
                  >
                    {alert.hp10}{" "}
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      mSv
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* COMPANY REGISTRY SECTION */}
      <section>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Building2 size={24} color="var(--primary)" />
          Registro de Empresas
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {!companies || companies.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "5rem",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <Building2
                size={64}
                color="var(--text-muted)"
                style={{ marginBottom: "1.5rem", opacity: 0.2 }}
              />
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                Sin empresas registradas
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
                Comienza registrando tu primera empresa cliente.
              </p>
              <Link href="/lab/companies/new" className="btn btn-primary">
                Registrar Empresa
              </Link>
            </div>
          ) : (
            companies.map((company) => (
              <div
                key={company.id}
                className="glass-panel"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(6, 182, 212, 0.1)",
                      padding: "0.6rem",
                      borderRadius: "10px",
                      color: "var(--primary)",
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      fontWeight: 800,
                      background: "rgba(255,255,255,0.05)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                    }}
                  >
                    {company.tax_id}
                  </span>
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {company.name}
                  </h3>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Users size={12} />
                      {Array.isArray(company.toe_workers) && company.toe_workers.length > 0
                        ? company.toe_workers[0].count
                        : 0}{" "}
                      TOEs
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Calendar size={12} />
                      {company.sector || "General"}
                    </span>
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}
                >
                  <Link
                    href={`/lab/companies/${company.id}/workers`}
                    className="btn"
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.05)",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      padding: "0.5rem",
                    }}
                  >
                    Trabajadores
                  </Link>
                  <Link
                    href={`/lab/companies/${company.id}`}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      padding: "0.5rem",
                    }}
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
