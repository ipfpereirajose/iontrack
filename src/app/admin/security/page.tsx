import { ShieldAlert } from "lucide-react";
import { Suspense } from "react";
import CyberSecurityDashboardWidget from "@/components/admin/security/CyberSecurityDashboardWidget";

export const revalidate = 0;

export default async function CyberSecurityPage() {
  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              padding: "0.75rem",
              borderRadius: "12px",
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>
            Centinela de Ciberseguridad
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)" }}>
          Monitoreo en tiempo real de amenazas, integridad de datos y accesos no autorizados.
        </p>
      </header>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando datos de seguridad...</div>}>
        <CyberSecurityDashboardWidget />
      </Suspense>
    </div>
  );
}
