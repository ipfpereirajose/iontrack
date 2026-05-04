import { Suspense } from "react";
import YearSelector from "@/components/lab/YearSelector";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { Plus } from "lucide-react";
import CompanyTrendChartWrapper from "@/components/lab/companies/CompanyTrendChartWrapper";
import CriticalAlertsListWidget from "@/components/lab/companies/CriticalAlertsListWidget";
import CompaniesListWidget from "@/components/lab/companies/CompaniesListWidget";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: selectedYear = new Date().getFullYear().toString() } =
    await searchParams;
  
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const tenantId = profile?.tenant_id;
  if (!tenantId)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        No tienes un laboratorio asignado.
      </div>
    );

  const targetYear = parseInt(selectedYear);

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>Dashboard de Empresas</h1>
          <p style={{ color: "var(--text-muted)" }}>Monitoreo dosimétrico y gestión de entidades clientes.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <YearSelector currentYear={targetYear} />
          <Link href="/lab/companies/new" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> Nueva Empresa
          </Link>
        </div>
      </header>

      <div style={{ marginBottom: "2.5rem" }}>
        <Suspense fallback={<div className="clean-panel" style={{ minHeight: "450px" }}>Cargando gráfica de tendencia...</div>}>
          <CompanyTrendChartWrapper tenantId={tenantId} targetYear={targetYear} />
        </Suspense>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        <Suspense fallback={<div className="clean-panel">Cargando alertas críticas...</div>}>
          <CriticalAlertsListWidget tenantId={tenantId} />
        </Suspense>
      </div>

      <Suspense fallback={<div className="glass-panel" style={{ padding: "5rem", textAlign: "center" }}>Cargando lista de empresas...</div>}>
        <CompaniesListWidget tenantId={tenantId} />
      </Suspense>
    </div>
  );
}
