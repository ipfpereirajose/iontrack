import RegulatoryReportsWidget from "@/components/lab/reports/RegulatoryReportsWidget";
import OtherDocumentsWidget from "@/components/lab/reports/OtherDocumentsWidget";

export default function LabReportsPage() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
          Reportes y Certificados
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Gestión de reportes oficiales para clientes y autoridades reguladoras.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2.5rem" }}>
        {/* LEFT: REGULATORY REPORTS */}
        <RegulatoryReportsWidget />

        {/* RIGHT: QUICK ACTIONS */}
        <OtherDocumentsWidget />
      </div>
    </div>
  );
}
