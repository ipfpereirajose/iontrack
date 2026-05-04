import { FileText } from "lucide-react";

export default function TemplatesDownload() {
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
        <FileText size={20} color="var(--primary-teal)" />
        2. Descargar Plantillas
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <a
          href="/templates/plantilla_empresas_osr.csv"
          download
          className="btn"
          style={{ background: "#f1f5f9", fontSize: "0.8rem", justifyContent: "flex-start" }}
        >
          <FileText size={16} /> Plantilla Empresas y OSR
        </a>
        <a
          href="/templates/plantilla_trabajadores.csv"
          download
          className="btn"
          style={{ background: "#f1f5f9", fontSize: "0.8rem", justifyContent: "flex-start" }}
        >
          <FileText size={16} /> Plantilla Trabajadores TOE
        </a>
        <a
          href="/templates/plantilla_dosis.csv"
          download
          className="btn"
          style={{ background: "#f1f5f9", fontSize: "0.8rem", justifyContent: "flex-start" }}
        >
          <FileText size={16} /> Plantilla Reporte de Dosis
        </a>
      </div>
    </section>
  );
}
