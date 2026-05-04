import { CheckCircle2, Loader2 } from "lucide-react";

export default function DataPreview({
  preview,
  importType,
  missingCols,
  loading,
  progress,
  rawDataLength,
  processImport,
}: {
  preview: any[];
  importType: "companies" | "workers" | "doses" | null;
  missingCols: string[];
  loading: boolean;
  progress: number;
  rawDataLength: number;
  processImport: () => void;
}) {
  if (preview.length === 0) return null;

  return (
    <div className="clean-panel" style={{ padding: "0", overflow: "hidden" }}>
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f8fafc",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Pre-visualización de Datos</h3>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 800 }}>
          MUESTRA INICIAL
        </span>
      </div>
      <div style={{ overflowX: "auto", paddingBottom: "1rem" }}>
        <table style={{ minWidth: "100%", whiteSpace: "nowrap" }}>
          <thead>
            <tr>
              {Object.keys(preview[0]).map((key) => (
                <th key={key} style={{ padding: "1rem 1.5rem" }}>
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val: any, j) => (
                  <td key={j} style={{ fontWeight: 600, padding: "1rem 1.5rem" }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          padding: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f8fafc",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ fontSize: "0.85rem", flex: 1 }}>
          {!importType ? (
            <span style={{ color: "var(--state-danger)", fontWeight: 800 }}>
              ⚠️ Seleccione un tipo de importación a la izquierda
            </span>
          ) : missingCols.length > 0 ? (
            <span style={{ color: "var(--state-danger)", fontWeight: 800 }}>
              ⚠️ Faltan columnas: {missingCols.join(", ")}
            </span>
          ) : loading ? (
            <div style={{ width: "100%", paddingRight: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontWeight: 800 }}>
                <span style={{ color: "var(--primary-teal)" }}>Procesando Datos...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "var(--primary-teal)", transition: "width 0.3s ease" }} />
              </div>
            </div>
          ) : (
            <span style={{ color: "var(--primary-teal)", fontWeight: 700 }}>
              ✓ Preparado para importar {rawDataLength} {importType === "doses" ? "Dosis" : importType === "workers" ? "Trabajadores" : "Empresas"}
            </span>
          )}
        </div>
        <button
          onClick={processImport}
          disabled={loading || !importType || missingCols.length > 0}
          className="btn btn-primary"
          style={{ gap: "0.75rem", padding: "0.75rem 2.5rem" }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
          {loading ? "Procesando..." : `Confirmar e Importar`}
        </button>
      </div>
    </div>
  );
}
