import { Database, Shield, Users, ClipboardList } from "lucide-react";

type ImportType = "companies" | "workers" | "doses" | null;

export default function ImportTypeSelector({
  importType,
  setImportType,
}: {
  importType: ImportType;
  setImportType: (type: ImportType) => void;
}) {
  const cardStyle = (type: ImportType) => ({
    flex: 1,
    padding: "1.5rem",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
    background: importType === type ? "rgba(0, 168, 181, 0.05)" : "white",
    border: `2px solid ${importType === type ? "var(--primary-teal)" : "var(--border)"}`,
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    alignItems: "center",
    textAlign: "center" as const,
  });

  return (
    <section className="clean-panel">
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 800,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <Database size={20} color="var(--primary-teal)" />
        1. Seleccione Instancia
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div onClick={() => setImportType("companies")} style={cardStyle("companies")}>
          <Shield size={24} color={importType === "companies" ? "var(--primary-teal)" : "var(--text-muted)"} />
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>Empresas / OSR</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Carga de entidades y responsables.</div>
          </div>
        </div>
        <div onClick={() => setImportType("workers")} style={cardStyle("workers")}>
          <Users size={24} color={importType === "workers" ? "var(--primary-teal)" : "var(--text-muted)"} />
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>Trabajadores (TOE)</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Carga masiva de personal expuesto.</div>
          </div>
        </div>
        <div onClick={() => setImportType("doses")} style={cardStyle("doses")}>
          <ClipboardList size={24} color={importType === "doses" ? "var(--primary-teal)" : "var(--text-muted)"} />
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>Reportes de Dosis</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Carga de lecturas mensuales por ID.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
