import { ClipboardList, FileText, Send } from "lucide-react";

export default function OtherDocumentsWidget() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section className="clean-panel">
        <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "1.5rem" }}>
          Otros Documentos
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button className="btn" style={{ background: "#f1f5f9", justifyContent: "flex-start" }}>
            <ClipboardList size={18} color="var(--primary-teal)" />
            Certificados Individuales
          </button>
          <button className="btn" style={{ background: "#f1f5f9", justifyContent: "flex-start" }}>
            <FileText size={18} color="var(--primary-teal)" />
            Estadísticas por Empresa
          </button>
          <button className="btn" style={{ background: "#f1f5f9", justifyContent: "flex-start" }}>
            <Send size={18} color="var(--primary-teal)" />
            Notificar a Autoridad (Email)
          </button>
        </div>
      </section>

      <div className="clean-panel" style={{ background: "var(--primary-dark)", color: "white" }}>
        <h4 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>Recordatorio</h4>
        <p style={{ fontSize: "0.8rem", opacity: 0.8, lineHeight: "1.5" }}>
          Los reportes deben ser enviados a la autoridad reguladora dentro de los primeros 5 días de cada mes después de la carga masiva.
        </p>
      </div>
    </div>
  );
}
