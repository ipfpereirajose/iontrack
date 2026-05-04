import { Suspense } from "react";
import CompanySettingsFormWidget from "@/components/portal/settings/CompanySettingsFormWidget";

export default async function CompanySettingsPage() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
            color: "var(--text-main)"
          }}
        >
          Configuración de Empresa
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Gestione su información institucional y datos de contacto.
        </p>
      </header>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando configuración...</div>}>
        <CompanySettingsFormWidget />
      </Suspense>
    </div>
  );
}
