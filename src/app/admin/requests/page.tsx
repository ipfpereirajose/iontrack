import { Suspense } from "react";
import RequestsListWidget from "@/components/admin/requests/RequestsListWidget";

export default async function RequestsPage() {
  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
          }}
        >
          Solicitudes de Cambio
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Revise y apruebe las actualizaciones de perfil solicitadas por los laboratorios.
        </p>
      </header>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando solicitudes pendientes...</div>}>
        <RequestsListWidget />
      </Suspense>
    </div>
  );
}
