import { Building2, Calendar } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";
import YearSelector from "@/components/lab/YearSelector";
import InteractiveTrendChart from "@/components/lab/InteractiveTrendChart";
import CompaniesCountWidget from "@/components/lab/dashboard/CompaniesCountWidget";
import ToeWorkersCountWidget from "@/components/lab/dashboard/ToeWorkersCountWidget";
import PendingDosesWidget from "@/components/lab/dashboard/PendingDosesWidget";
import CriticalAlertsWidget from "@/components/lab/dashboard/CriticalAlertsWidget";
import CriticalNotificationsSidebar from "@/components/lab/dashboard/CriticalNotificationsSidebar";
import RecentValidationsTable from "@/components/lab/dashboard/RecentValidationsTable";
import { Suspense } from "react";

export default async function LabHomePage({
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

  // Fetch company IDs for this tenant (required for the chart)
  const { data: tenantCompanies } = await adminSupabase
    .from("companies")
    .select("id")
    .eq("tenant_id", tenantId);
  const companyIds = tenantCompanies?.map((c) => c.id) || [];

  if (companyIds.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
        <Building2 size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
        <h2 style={{ fontWeight: 800 }}>Bienvenido a IonTrack</h2>
        <p style={{ color: 'var(--text-muted)' }}>Para comenzar, carga tus empresas clientes en la sección de Empresas.</p>
        <Link href="/lab/bulk-import" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          Ir a Carga Masiva
        </Link>
      </div>
    );
  }

  // Fetch worker IDs for the chart (InteractiveTrendChart still needs them as props)
  const { data: tenantWorkers } = await adminSupabase
    .from("toe_workers")
    .select("id")
    .in("company_id", companyIds);
  const workerIds = tenantWorkers?.map(w => w.id) || [];

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1600px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "3rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Dashboard General
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Estado operativo y vigilancia dosimétrica del laboratorio.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <YearSelector currentYear={targetYear} />
          <button
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Calendar size={18} />
            Periodo Actual
          </button>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <Suspense fallback={<div className="clean-panel">Cargando empresas...</div>}>
          <CompaniesCountWidget tenantId={tenantId} />
        </Suspense>

        <Suspense fallback={<div className="clean-panel">Cargando personal TOE...</div>}>
          <ToeWorkersCountWidget tenantId={tenantId} />
        </Suspense>

        <Suspense fallback={<div className="clean-panel">Cargando pendientes...</div>}>
          <PendingDosesWidget tenantId={tenantId} />
        </Suspense>

        <Suspense fallback={<div className="clean-panel">Cargando alertas...</div>}>
          <CriticalAlertsWidget tenantId={tenantId} targetYear={targetYear} />
        </Suspense>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "2rem" }}>
        {/* CHART SECTION */}
        <InteractiveTrendChart workerIds={workerIds} targetYear={targetYear} />

        {/* SIDEBAR: CRITICAL NOTIFICATIONS */}
        <Suspense fallback={<div className="clean-panel">Cargando notificaciones críticas...</div>}>
          <CriticalNotificationsSidebar tenantId={tenantId} targetYear={targetYear} />
        </Suspense>
      </div>

      {/* RECENT VALIDATIONS */}
      <Suspense fallback={<div className="clean-panel" style={{ marginTop: "3rem" }}>Cargando validaciones recientes...</div>}>
        <RecentValidationsTable tenantId={tenantId} />
      </Suspense>
    </div>
  );
}
