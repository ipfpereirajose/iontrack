import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import ToeFiltersForm from "@/components/lab/toe-consultation/ToeFiltersForm";
import ToeWorkersList from "@/components/lab/toe-consultation/ToeWorkersList";
import { Users } from "lucide-react";

export default async function TOEConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; company?: string }>;
}) {
  const { query, company } = await searchParams;
  const { profile } = await getCurrentProfile();
  const tenantId = profile?.tenant_id;

  if (!tenantId) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>No tienes un laboratorio asignado.</div>;
  }

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
          Consulta de TOEs
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Búsqueda global y trazabilidad histórica de trabajadores ocupacionalmente expuestos.
        </p>
      </header>

      {/* SEARCH & FILTERS */}
      <Suspense fallback={<div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem" }}>Cargando filtros...</div>}>
        <ToeFiltersForm tenantId={tenantId} currentQuery={query} currentCompany={company} />
      </Suspense>

      {/* WORKERS TABLE */}
      <Suspense fallback={
        <div className="clean-panel" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
          <Users size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
          <p>Cargando lista de trabajadores...</p>
        </div>
      }>
        <ToeWorkersList tenantId={tenantId} query={query} company={company} />
      </Suspense>
    </div>
  );
}
