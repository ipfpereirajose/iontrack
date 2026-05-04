import { Activity } from "lucide-react";
import { Suspense } from "react";
import TelemetryDashboardWidgets from "@/components/admin/telemetry/TelemetryDashboardWidgets";

export default function TelemetryPage() {
  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Activity size={32} color="var(--primary)" />
          Telemetría del Sistema
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Monitoreo en tiempo real de la infraestructura I.O.N.T.R.A.C.K. global.
        </p>
      </header>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando telemetría...</div>}>
        <TelemetryDashboardWidgets />
      </Suspense>
    </div>
  );
}
