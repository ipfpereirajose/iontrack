import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import MonthlyPDFReportButton from "@/components/lab/MonthlyPDFReportButton";
import PortalDashboardWidget from "@/components/portal/PortalDashboardWidget";

export default async function B2BHomePage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const companyId = profile?.company_id;
  const companyName = (profile as any)?.companies?.name || "Empresa Cliente";

  // Get the latest month for the report button
  const { data: latestDoses } = await supabase
    .from("doses")
    .select("month, year, toe_workers!inner(company_id)")
    .eq("toe_workers.company_id", companyId)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(1);

  return (
    <div>
      <header
        style={{
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-main)" }}
          >
            {companyName}
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Resumen de Vigilancia Radiológica Ocupacional
          </p>
        </div>
        <div style={{ width: "240px" }}>
          <MonthlyPDFReportButton 
            month={latestDoses && latestDoses.length > 0 ? latestDoses[0].month : new Date().getMonth() + 1}
            year={latestDoses && latestDoses.length > 0 ? latestDoses[0].year : new Date().getFullYear()}
          />
        </div>
      </header>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando resumen de vigilancia...</div>}>
        <PortalDashboardWidget companyId={companyId} />
      </Suspense>
    </div>
  );
}
