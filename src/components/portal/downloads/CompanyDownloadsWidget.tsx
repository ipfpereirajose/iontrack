import { Download, FileText, ShieldCheck, Search } from "lucide-react";
import MonthlyReportSection from "./MonthlyReportSection";

interface Props {
  companyId: string;
}

export default function CompanyDownloadsWidget({ companyId }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
      {/* CERTIFICADOS */}
      <div className="clean-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ padding: "1rem", background: "rgba(0, 168, 181, 0.1)", borderRadius: "15px", width: "fit-content" }}>
          <ShieldCheck size={28} color="var(--primary-teal)" />
        </div>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Certificados de Dosis
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Descargue los certificados individuales validados de su personal expuesto (TOE).
          </p>
        </div>
        <button className="btn btn-primary" style={{ marginTop: "auto", gap: "0.75rem" }}>
          <Search size={18} /> Consultar Certificados
        </button>
      </div>

      {/* REPORTES MENSUALES (FORMATO PHYSION) */}
      <MonthlyReportSection companyId={companyId} />

      {/* DOCUMENTACION TECNICA */}
      <div className="clean-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ padding: "1rem", background: "rgba(245, 158, 11, 0.1)", borderRadius: "15px", width: "fit-content" }}>
          <FileText size={28} color="var(--state-warning)" />
        </div>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Manuales y Normas
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Guías de usuario, normativas de protección radiológica y protocolos de emergencia.
          </p>
        </div>
        <button className="btn" style={{ marginTop: "auto", background: "#f1f5f9", gap: "0.75rem" }}>
          <Download size={18} /> Descargar Guías
        </button>
      </div>
    </div>
  );
}
