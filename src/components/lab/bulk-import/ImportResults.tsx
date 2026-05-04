import { CheckCircle2, AlertCircle, Fingerprint, Download } from "lucide-react";
import * as XLSX from "xlsx";
import RegulatoryReportButton from "@/components/lab/RegulatoryReportButton";

export default function ImportResults({
  results,
}: {
  results: { success: number; errors: any[]; mapping?: any[] } | null;
}) {
  if (!results) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {results.mapping && results.mapping.length > 0 && (
        <div
          className="clean-panel"
          style={{
            background: "rgba(0, 168, 181, 0.05)",
            border: "1px solid var(--primary-teal)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Fingerprint size={32} color="var(--primary-teal)" />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-teal)" }}>
                Relación de IDs Generada
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Se ha generado el mapeo de RIF vs Código de Instalación único. Úselo para sus cargas masivas de trabajadores y dosis.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const ws = XLSX.utils.json_to_sheet(results.mapping!);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Relacion_IDs");
              XLSX.writeFile(wb, `Relacion_Sedes_IonTrack_${new Date().toISOString().split("T")[0]}.xlsx`);
            }}
            className="btn btn-primary"
            style={{ background: "var(--primary-teal)", alignSelf: "flex-start", gap: "0.75rem" }}
          >
            <Download size={18} /> Descargar Relación de Sedes (Excel)
          </button>
        </div>
      )}

      <div
        className="clean-panel"
        style={{
          background: "rgba(16, 185, 129, 0.05)",
          border: "1px solid var(--state-safe)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <CheckCircle2 size={32} color="var(--state-safe)" />
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--state-safe)" }}>
              Procesamiento Finalizado
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600 }}>
              Se han procesado {results.success} registros correctamente.
            </p>
          </div>
        </div>
        <RegulatoryReportButton
          month={new Date().getMonth() + 1}
          year={new Date().getFullYear()}
          tenantName="Laboratorio Central"
        />
      </div>

      {results.errors.length > 0 && (
        <div
          className="clean-panel"
          style={{
            background: "rgba(239, 68, 68, 0.05)",
            border: "1px solid var(--state-danger)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <AlertCircle size={32} color="var(--state-danger)" />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--state-danger)" }}>
                Errores Detectados ({results.errors.length})
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Los siguientes registros no pudieron ser procesados:
              </p>
            </div>
          </div>
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {results.errors.map((err, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: "0.8125rem",
                  padding: "1rem",
                  background: "white",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <span style={{ color: "var(--state-danger)", fontWeight: 800 }}>Fila {idx + 1}:</span> {err.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
