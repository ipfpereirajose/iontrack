import { Suspense } from "react";
import CompanyDownloadsWidget from "@/components/portal/downloads/CompanyDownloadsWidget";

export default async function CompanyDownloadsPage() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
          }}
        >
          Centro de Descargas
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Acceda a sus certificados oficiales, reportes mensuales y documentación técnica.
        </p>
      </header>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando centro de descargas...</div>}>
        <CompanyDownloadsWidget companyId={profile?.company_id || ""} />
      </Suspense>

      <div
        className="clean-panel"
        style={{
          marginTop: "3rem",
          background: "#f8fafc",
          border: "1px dashed var(--border)",
          textAlign: "center",
          padding: "3rem",
        }}
      >
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          ¿Necesita un documento especial o un aval oficial firmado por el
          laboratorio? Contacte directamente con su proveedor de servicios.
        </p>
      </div>
    </div>
  );
}
