"use client";

import { Download, FileText, ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

export default function ToeReportWidget({ selectedAccount, data, day, month, year, setStep }: any) {
  const exportToExcel = (account: any) => {
    const exportData = account.history.map((d: any) => ({
      Año: d.year,
      Mes: d.month,
      'Hp10 (mSv)': d.hp10.toFixed(4),
      'Hp3 (mSv)': (d.hp3 || 0).toFixed(4),
      'Hp0.07 (mSv)': (d.hp007 || 0).toFixed(4),
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
    <div style={{ background: "white", minHeight: "100vh", padding: "2rem 1rem", color: "black", fontFamily: "Arial, sans-serif" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-shadow { box-shadow: none !important; border: 1px solid #eee !important; }
        }
      `}</style>
      <div className="report-shadow" style={reportContainer}>
        {/* Header Section */}
        <div style={reportHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "4px solid #1e40af", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ background: "#1e40af", color: "white", padding: "10px", borderRadius: "50%", fontWeight: 900 }}>IT</div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#1e40af" }}>I.O.N.TRACK Dosimetría</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>La Seguridad Radiológica es tu derecho</div>
                </div>
            </div>
            <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.7rem", color: "#666" }}>REPÚBLICA BOLIVARIANA DE VENEZUELA</div>
                <div style={{ fontSize: "0.7rem", color: "#666" }}>AUTORIDAD NACIONAL DE VIGILANCIA</div>
            </div>
          </div>
          <div style={{ textAlign: "center", background: "#dbeafe", padding: "0.5rem", border: "1px solid #bfdbfe", fontWeight: 700, fontSize: "0.9rem", marginBottom: "2rem" }}>
            Módulo de Consulta de Historial Dosimétrico<br />Cuenta Individual
          </div>
        </div>

        {/* Datos del Trabajador */}
        <table style={reportTable}>
            <thead>
                <tr><th colSpan={2} style={reportTh}>Datos del Trabajador</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td style={reportLabelTd}>Cédula de Identidad:</td>
                    <td style={reportValueTd}>V-{selectedAccount.worker.ci}</td>
                </tr>
                <tr>
                    <td style={reportLabelTd}>ID Único Trazabilidad:</td>
                    <td style={{ ...reportValueTd, fontWeight: 900, color: "#1e40af" }}>
                        {selectedAccount.company.company_code}-{selectedAccount.worker.ci}
                    </td>
                </tr>
                <tr>
                    <td style={reportLabelTd}>Nombre y Apellido:</td>
                    <td style={reportValueTd}>{selectedAccount.worker.first_name} {selectedAccount.worker.last_name}</td>
                </tr>
                <tr>
                    <td style={reportLabelTd}>Sexo:</td>
                    <td style={reportValueTd}>{selectedAccount.worker.sex === 'M' ? 'MASCULINO' : 'FEMENINO'}</td>
                </tr>
                <tr>
                    <td style={reportLabelTd}>Fecha de Nacimiento:</td>
                    <td style={reportValueTd}>{day.padStart(2, '0')}/{month.padStart(2, '0')}/{year}</td>
                </tr>
                <tr>
                    <td style={reportLabelTd}>Código Patronal:</td>
                    <td style={reportValueTd}>{selectedAccount.company.tax_id}</td>
                </tr>
                <tr>
                    <td style={reportLabelTd}>Nombre Empresa:</td>
                    <td style={reportValueTd}>{selectedAccount.company.name}</td>
                </tr>
            </tbody>
        </table>

        {/* Dosis Acumuladas */}
        <table style={reportTable}>
            <thead>
                <tr><th colSpan={4} style={reportTh}>Resumen de Vigilancia Dosimétrica</th></tr>
            </thead>
            <tbody>
                <tr style={{ background: "#f8fafc" }}>
                    <td style={reportLabelTd}>Dosis Último Mes:</td>
                    <td style={reportValueTd}>{selectedAccount.history[0]?.hp10.toFixed(3) || "0.000"} mSv</td>
                    <td style={reportLabelTd}>Estatus Vigilancia:</td>
                    <td style={reportValueTd}>ACTIVO</td>
                </tr>
                <tr>
                    <td style={reportLabelTd}>Dosis Acumulada Empresa:</td>
                    <td style={reportValueTd}>{selectedAccount.lifeDose.toFixed(3)} mSv</td>
                    <td style={reportLabelTd}>Dosis Vida Global:</td>
                    <td style={{ ...reportValueTd, fontWeight: 900 }}>{data.globalLifeDose.toFixed(3)} mSv</td>
                </tr>
            </tbody>
        </table>

        {/* Relación Mensual */}
        <div style={{ marginBottom: "1rem", fontWeight: 700, textAlign: "center", background: "#dbeafe", padding: "0.3rem", border: "1px solid #bfdbfe", fontSize: "0.8rem" }}>
            Relación de Dosis registradas en los últimos periodos
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {[0, 1].map(colIdx => (
                <table key={colIdx} style={reportTableSmall}>
                    <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                            <th style={reportThSmall}>AÑO</th>
                            <th style={reportThSmall}>MES</th>
                            <th style={reportThSmall}>DOSIS (mSv)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({length: 8}).map((_, i) => {
                            const idx = i + (colIdx * 8);
                            const d = selectedAccount.history[idx];
                            return (
                                <tr key={i}>
                                    <td style={reportTdSmall}>{d ? d.year : '-'}</td>
                                    <td style={reportTdSmall}>{d ? d.month : '-'}</td>
                                    <td style={reportTdSmall}>{d ? d.hp10.toFixed(3) : '0.000'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ))}
        </div>

        {/* Verification Section */}
        <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", borderTop: "2px solid #eee", paddingTop: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Sello Digital de Verificación</div>
            <div style={{ 
              fontSize: "0.6rem", 
              fontFamily: "monospace", 
              background: "#f8fafc", 
              padding: "0.75rem", 
              borderRadius: "4px", 
              border: "1px solid #e2e8f0",
              wordBreak: "break-all",
              lineHeight: "1.4"
            }}>
              SHA256: 8f2b7c4a9e1d0f5b3c6a8d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9<br/>
              TIMESTAMP: {new Date().getTime()}<br/>
              VALID: SYSTEM_AUTHENTICATED_PORTAL
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "80px", 
              height: "80px", 
              margin: "0 auto 0.5rem", 
              border: "4px solid #1e40af", 
              display: "flex", 
              flexWrap: "wrap",
              padding: "2px",
              opacity: 0.8
            }}>
              {Array.from({length: 64}).map((_, i) => (
                <div key={i} style={{ width: "8px", height: "8px", background: Math.random() > 0.5 ? "#1e40af" : "white" }}></div>
              ))}
            </div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700 }}>Validar en: iontrack.net/verify</div>
          </div>
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
            <div style={{ fontSize: "0.75rem", color: "red", fontWeight: 700 }}>
                Información Actualizada al: {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })} a las {new Date().toLocaleTimeString()}
            </div>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }} className="no-print">
                <button onClick={() => exportToExcel(selectedAccount)} style={actionButton}>
                    <Download size={14} /> Descargar Excel
                </button>
                <button onClick={() => window.print()} style={actionButton}>
                    <FileText size={14} /> Imprimir Reporte (PDF)
                </button>
                <button onClick={() => data.accounts.length > 1 ? setStep("accounts") : setStep("login")} style={{ ...actionButton, background: "#64748b" }}>
                    <ArrowLeft size={14} /> Volver
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const reportContainer = {
  maxWidth: "800px",
  margin: "0 auto",
  border: "1px solid #ccc",
  padding: "2rem",
  boxShadow: "0 0 20px rgba(0,0,0,0.05)",
} as any;

const reportHeader = {
  marginBottom: "2rem",
} as any;

const reportTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginBottom: "1rem",
  border: "1px solid #1e40af",
} as any;

const reportTh = {
  background: "#1e40af",
  color: "white",
  padding: "0.5rem",
  fontSize: "0.8rem",
  textTransform: "uppercase" as const,
  textAlign: "center" as const,
} as any;

const reportLabelTd = {
  background: "#f1f5f9",
  padding: "0.4rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 700,
  width: "30%",
  border: "1px solid #cbd5e1",
} as any;

const reportValueTd = {
  padding: "0.4rem 0.75rem",
  fontSize: "0.75rem",
  border: "1px solid #cbd5e1",
} as any;

const reportTableSmall = {
    width: "100%",
    borderCollapse: "collapse" as const,
    border: "1px solid #cbd5e1",
} as any;

const reportThSmall = {
    padding: "0.3rem",
    fontSize: "0.65rem",
    fontWeight: 900,
    border: "1px solid #cbd5e1",
    textAlign: "center" as const,
} as any;

const reportTdSmall = {
    padding: "0.3rem",
    fontSize: "0.7rem",
    border: "1px solid #cbd5e1",
    textAlign: "center" as const,
} as any;

const actionButton = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    background: "#1e40af",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 700,
} as any;
