import { CreditCard } from "lucide-react";
import { Suspense } from "react";
import BillingDashboardWidget from "@/components/admin/billing/BillingDashboardWidget";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
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
          <CreditCard size={32} color="var(--primary)" />
          Control de Facturación
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Monitoreo de suscripciones mensuales y gestión de morosidad.
        </p>
      </header>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando datos de facturación...</div>}>
        <BillingDashboardWidget />
      </Suspense>
    </div>
  );
}
