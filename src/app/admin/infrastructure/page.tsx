import { GitBranch, Database } from "lucide-react";
import { Suspense } from "react";
import TenantHierarchyWidget from "@/components/admin/infrastructure/TenantHierarchyWidget";

export const revalidate = 0;

export default async function InfrastructurePage() {
  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <div style={{ background: "rgba(6, 182, 212, 0.1)", color: "var(--primary)", padding: "0.75rem", borderRadius: "12px" }}>
            <GitBranch size={28} />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>
            Mapa de Infraestructura Lineal
          </h1>
        </div>
        <p style={{ color: "var(--text-muted)" }}>
          Visualización de la relación jerárquica entre Laboratorios, Empresas Clientes y Volumen de Servicios.
        </p>
      </header>

      <Suspense fallback={<div className="clean-panel" style={{ padding: "4rem", textAlign: "center" }}>Cargando infraestructura...</div>}>
        <TenantHierarchyWidget />
      </Suspense>

      {/* INFRASTRUCTURE HEALTH CARD */}
      <div
        className="clean-panel"
        style={{
          marginTop: "3rem",
          borderLeft: "4px solid var(--primary-dark)",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <div style={{ background: "rgba(26, 54, 93, 0.05)", padding: "1.5rem", borderRadius: "16px", color: "var(--primary-dark)" }}>
          <Database size={32} />
        </div>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            Salud Global de la Infraestructura
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Todos los nodos de laboratorio y bases de datos regionales están sincronizados correctamente. Latencia media: 42ms.
          </p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
            UPTIME TOTAL
          </p>
          <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--state-safe)" }}>
            99.98%
          </p>
        </div>
      </div>
    </div>
  );
}
