import { ClipboardCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { Suspense } from "react";
import ValidationTableWidget from "@/components/lab/validation/ValidationTableWidget";

export default async function ValidationPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const { month, year } = await searchParams;
  const tenantId = profile?.tenant_id;

  if (!tenantId) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>No tienes un laboratorio asignado.</div>;
  }

  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <div style={{ background: "var(--primary-teal)", color: "white", padding: "0.75rem", borderRadius: "12px" }}>
            <ClipboardCheck size={28} />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-main)" }}>
            Bandeja de Validación
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)" }}>
          Revisa y aprueba las dosis enviadas por el Agente Local antes de publicarlas a los clientes.
        </p>
      </header>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando tabla de validación...</div>}>
        <ValidationTableWidget tenantId={tenantId} month={month} year={year} />
      </Suspense>
    </div>
  );
}

export const revalidate = 0;
