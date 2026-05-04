import { getCurrentProfile } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import YearSelector from "@/components/lab/YearSelector";
import { Suspense } from "react";
import AlertsTableWidget from "@/components/lab/alerts/AlertsTableWidget";

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

  if (!tenantId) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>No tienes un laboratorio asignado.</div>;
  }

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

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando alertas...</div>}>
        <AlertsTableWidget tenantId={tenantId} targetYear={targetYear} />
      </Suspense>
    </div>
  );
}
