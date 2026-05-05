"use client";

import { Download, FileText, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

export default function ToeReportWidget({ selectedAccount, data, day, month, year, setStep }: any) {
  const exportToExcel = (account: any) => {
    const exportData = account.history.map((d: any) => ({
      Año: d.year,
      Mes: d.month,
      'Hp10 (mSv)': Number(d.hp10 || 0).toFixed(4),
      'Hp3 (mSv)': Number(d.hp3 || 0).toFixed(4),
      'Hp0.07 (mSv)': Number(d.hp007 || 0).toFixed(4),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cuenta_Individual");
    
    XLSX.utils.sheet_add_aoa(ws, [
      [],
      ["DATOS DEL TRABAJADOR"],
      ["Nombre", `${account.worker.first_name} ${account.worker.last_name}`],
      ["CI", account.worker.ci],
      ["Empresa", account.company.name],
      ["Dosis Acumulada en Empresa (mSv)", account.lifeDose.toFixed(4)],
      ["Dosis Vida Global (mSv)", data.globalLifeDose.toFixed(4)],
    ], { origin: -1 });

    XLSX.writeFile(wb, `Reporte_Dosis_${account.worker.ci}_${account.company.company_code}.xlsx`);
  };

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: "2rem 1rem", color: "black", fontFamily: "Helvetica, Arial, sans-serif" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .report-shadow { box-shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .page-break { page-break-before: always; }
        }
        .report-table th, .report-table td { border: 0.5px solid #000; padding: 4px 8px; font-size: 8pt; }
        .box-header { height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 9pt; color: black; border-bottom: 0.5px solid #000; }
      `}</style>

      <div className="report-shadow" style={reportContainer}>
        {/* TOP NAV BAR (BLUE) */}
        <div style={{ background: "#00447c", color: "white", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "4px 4px 0 0" }}>
          <span style={{ fontWeight: 900, fontSize: "11pt" }}>PHYSION TECNOLOGÍA NUCLEAR.</span>
          <span style={{ fontSize: "7.5pt", fontWeight: "bold", fontStyle: "italic", textAlign: "right", maxWidth: "60%" }}>
            SERVICIO DE MONITORIZACIÓN DE LA RADIACIÓN EXTERNA POR OSL. DOSIS EQUIVALENTE PERSONAL Hp (d) EN mSv INFORME INDIVIDUAL
          </span>
        </div>

        <div style={{ padding: "12mm" }}>
          {/* LOGO */}
          <div style={{ marginBottom: "15px" }}>
            <img src="/physion-logo.png" alt="PHYSION" style={{ height: "55px" }} />
          </div>

          {/* BOXES SECTION */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
            {/* BOX 1: DATOS DEL TRABAJADOR */}
            <div style={{ border: "0.5px solid #000", borderRadius: "8px", overflow: "hidden" }}>
              <div className="box-header" style={{ background: "#eb8991" }}>DATOS DEL TRABAJADOR</div>
              <div style={{ padding: "10px" }}>
                <table style={{ width: "100%", fontSize: "7.5pt", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr><td style={{ fontWeight: "bold", width: "40%", padding: "2px 0" }}>CÉDULA:</td><td>V-{String(selectedAccount?.worker?.ci || "").replace(/^[Vv]-?/, '')}</td></tr>
                    <tr><td style={{ fontWeight: "bold", padding: "2px 0" }}>NOMBRE COMPLETO:</td><td>{(selectedAccount?.worker?.first_name + " " + selectedAccount?.worker?.last_name).toUpperCase()}</td></tr>
                    <tr><td style={{ fontWeight: "bold", padding: "2px 0" }}>FECHA NACIMIENTO:</td><td>{(day || "01").padStart(2, '0')}/{(month || "01").padStart(2, '0')}/{year || "----"}</td></tr>
                    <tr><td style={{ fontWeight: "bold", padding: "2px 0" }}>EMPRESA ASOCIADA:</td><td>{(selectedAccount?.company?.name || "N/A").toUpperCase()}</td></tr>
                    <tr><td style={{ fontWeight: "bold", padding: "2px 0" }}>CARGO / PRÁCTICA:</td><td>{(selectedAccount?.worker?.position || "TOE").toUpperCase()}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOX 2: RESUMEN DE VIGILANCIA */}
            <div style={{ border: "0.5px solid #000", borderRadius: "8px", overflow: "hidden" }}>
              <div className="box-header" style={{ background: "#b40000", color: "white" }}>RESUMEN DE VIGILANCIA</div>
              <div style={{ padding: "10px" }}>
                <table style={{ width: "100%", fontSize: "7.5pt", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr><td style={{ fontWeight: "bold", width: "50%", padding: "2px 0" }}>ÚLTIMA DOSIS REGISTRADA:</td><td style={{ fontWeight: "bold" }}>{Number(selectedAccount?.history?.[0]?.hp10 || 0).toFixed(3)} mSv</td></tr>
                    <tr><td style={{ fontWeight: "bold", padding: "2px 0" }}>DOSIS ACUMULADA EMPRESA:</td><td style={{ fontWeight: "bold" }}>{Number(selectedAccount?.lifeDose || 0).toFixed(3)} mSv</td></tr>
                    <tr><td style={{ fontWeight: "bold", padding: "2px 0" }}>DOSIS VIDA GLOBAL:</td><td style={{ fontWeight: "900", color: "#1e40af" }}>{Number(data?.globalLifeDose || 0).toFixed(3)} mSv</td></tr>
                    <tr><td style={{ fontWeight: "bold", padding: "2px 0" }}>ESTATUS LABORAL:</td><td style={{ color: "#059669", fontWeight: "bold" }}>VIGILANCIA ACTIVA</td></tr>
                    <tr><td style={{ fontWeight: "bold", padding: "2px 0" }}>PERIODOS EVALUADOS:</td><td>{(selectedAccount?.history?.length || 0)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* HISTORIAL DETALLADO */}
          <div style={{ marginBottom: "5px", fontWeight: "bold", textAlign: "center", background: "#f1f5f9", padding: "4px", border: "0.5px solid #000", fontSize: "8pt", borderRadius: "4px 4px 0 0" }}>
            HISTORIAL DETALLADO DE EXPOSICIÓN (ÚLTIMOS PERIODOS)
          </div>
          <table className="report-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th>AÑO</th>
                <th>MES</th>
                <th>Hp(10) (mSv)</th>
                <th>Hp(3) (mSv)</th>
                <th>Hp(0.07) (mSv)</th>
                <th>OBSERVACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {selectedAccount?.history?.slice(0, 15).map((d: any, i: number) => (
                <tr key={i}>
                  <td>{d.year}</td>
                  <td>{d.month}</td>
                  <td style={{ fontWeight: "bold" }}>{Number(d.hp10 || 0).toFixed(3)}</td>
                  <td>{Number(d.hp3 || 0).toFixed(3)}</td>
                  <td>{Number(d.hp007 || 0).toFixed(3)}</td>
                  <td style={{ fontSize: "6.5pt" }}>{d.observacion || "Normal"}</td>
                </tr>
              ))}
              {(!selectedAccount?.history || selectedAccount.history.length === 0) && (
                <tr><td colSpan={6} style={{ padding: "20px" }}>No hay registros disponibles</td></tr>
              )}
            </tbody>
          </table>

          {/* FOOTER: LEYENDA Y FIRMA (Same as group report) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "10px", marginTop: "15px" }}>
            {/* LEYENDA TECNICA */}
            <div style={{ border: "0.5px solid #000", borderRadius: "8px", overflow: "hidden" }}>
              <div className="box-header" style={{ background: "#eb8991" }}>LEYENDA TÉCNICA</div>
              <div style={{ padding: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "6.5pt" }}>
                <div>
                  <p><strong>INCERTIDUMBRE:</strong> 4%</p>
                  <p><strong>VALOR REF. MENSUAL Hp(10):</strong> 1.67 mSv</p>
                  <p><strong>LIMITE DETECCIÓN:</strong> 0.10 mSv</p>
                </div>
                <div>
                  <p><strong>AUTORIZACIÓN MPPS:</strong> 0012-2022</p>
                  <p><strong>NIVEL INVESTIGACIÓN:</strong> 0.50 mSv</p>
                  <p><strong>SISTEMA:</strong> OSL (Harshaw)</p>
                </div>
              </div>
            </div>

            {/* FIRMA */}
            <div style={{ border: "0.5px solid #000", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="box-header" style={{ background: "#f8fafc" }}>VALIDACIÓN</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "5px" }}>
                <div style={{ width: "80%", borderTop: "0.5px solid #000", marginBottom: "4px" }}></div>
                <p style={{ fontSize: "7pt", fontWeight: "bold", margin: 0 }}>Firma Autorizada</p>
                <p style={{ fontSize: "6pt", margin: 0 }}>Laboratorio Physion</p>
              </div>
            </div>
          </div>

          {/* SYSTEM INFO */}
          <div style={{ marginTop: "15px", textAlign: "center", fontSize: "7pt", color: "#666" }}>
            Este documento es una Cuenta Individual generada por el sistema I.O.N.TRACK para fines informativos y de vigilancia epidemiológica.<br/>
            Generado el: {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* CONTROLS (NO PRINT) */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", padding: "1rem", borderTop: "1px solid #eee" }} className="no-print">
          <button onClick={() => exportToExcel(selectedAccount)} style={actionButton}>
            <Download size={14} /> Excel
          </button>
          <button onClick={() => window.print()} style={{ ...actionButton, background: "#059669" }}>
            <FileText size={14} /> Imprimir / PDF
          </button>
          <button onClick={() => setStep("accounts")} style={{ ...actionButton, background: "#64748b" }}>
            <ArrowLeft size={14} /> Volver
          </button>
        </div>
      </div>
    </div>
  );
}

// STYLES
const reportContainer = {
  width: "210mm",
  minHeight: "297mm",
  margin: "0 auto",
  background: "white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  borderRadius: "8px",
  overflow: "hidden"
} as any;

const actionButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.6rem 1.2rem",
  background: "#00447c",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: 700,
  transition: "all 0.2s"
} as any;
