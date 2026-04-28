"use client";

import { useState } from "react";
import {
  User,
  Shield,
  Search,
  Calendar,
  Activity,
  ArrowRight,
  Download,
  ArrowLeft,
  FileText,
  X,
  Building2,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function ToePortal() {
  const [step, setStep] = useState<"login" | "accounts" | "report">("login");
  const [ci, setCi] = useState("");
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState("1990");
  const [data, setData] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // In this version, we use the year for validation as we don't have full birth_date yet in all records
      const res = await fetch(`/api/toe/check?ci=${ci}&birth_year=${year}&day=${day}&month=${month}`);
      const result = await res.json();

      if (result.error) {
        setError("Cédula o Fecha de Nacimiento no válidas.");
      } else {
        setData(result);
        if (result.accounts.length === 1) {
          setSelectedAccount(result.accounts[0]);
          setStep("report");
        } else {
          setStep("accounts");
        }
      }
    } catch (err) {
      setError("Error de conexión. Intente más tarde.");
    } finally {
      setLoading(false);
    }
  };

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

  if (step === "login") {
    return (
      <div style={containerStyle}>
        <div style={loginModalStyle}>
          <div style={modalHeader}>
            <span style={{ fontWeight: 900, color: "white" }}>I.O.N.TRACK</span>
            <X size={20} color="#ef4444" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/"} />
          </div>
          <div style={modalBody}>
            <div style={modalTitle}>Cuenta Individual</div>
            <form onSubmit={handleLogin}>
              <div style={formGroup}>
                <label style={modalLabel}>CÉDULA ASEGURADO</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select style={modalSelectPrefix}>
                    <option>V.</option>
                    <option>E.</option>
                  </select>
                  <input 
                    required 
                    style={modalInput} 
                    value={ci} 
                    onChange={e => setCi(e.target.value)} 
                    placeholder="Número de cédula"
                  />
                </div>
              </div>
              <div style={formGroup}>
                <label style={modalLabel}>FECHA DE NACIMIENTO</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select style={modalSelect} value={day} onChange={e => setDay(e.target.value)}>
                    {Array.from({length: 31}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                  </select>
                  <select style={modalSelect} value={month} onChange={e => setMonth(e.target.value)}>
                    {["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"].map((m, i) => (
                      <option key={i+1} value={i+1}>{m}</option>
                    ))}
                  </select>
                  <select style={modalSelect} value={year} onChange={e => setYear(e.target.value)}>
                    {Array.from({length: 80}, (_, i) => {
                      const y = 2026 - i - 18;
                      return <option key={y} value={y}>{y}</option>
                    })}
                  </select>
                </div>
              </div>

              {error && <div style={{ color: "#fca5a5", fontSize: "0.8rem", marginBottom: "1rem", fontWeight: 700 }}>{error}</div>}

              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button type="submit" disabled={loading} style={modalButton}>
                  {loading ? "Consultando..." : "Consultar"}
                </button>
              </div>
            </form>
          </div>
          <div style={modalLogoWatermark}>IVSS</div>
        </div>
      </div>
    );
  }

  if (step === "accounts") {
    return (
      <div style={{ ...containerStyle, background: "#f1f5f9", alignItems: "flex-start", paddingTop: "5rem" }}>
        <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}>
          <header style={{ marginBottom: "2rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#1e293b" }}>Registros Encontrados</h1>
            <p style={{ color: "#64748b" }}>Se han detectado múltiples vinculaciones para la cédula {ci}. Seleccione una empresa para ver el detalle.</p>
          </header>
          <div style={{ display: "grid", gap: "1rem" }}>
            {data.accounts.map((acc: any, i: number) => (
              <div key={i} className="glass-panel" style={accountCardStyle} onClick={() => { setSelectedAccount(acc); setStep("report"); }}>
                <div style={accountCardIcon}>
                  <Building2 size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{acc.company.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>RIF: {acc.company.tax_id} | Código: {acc.company.company_code}</div>
                </div>
                <ArrowRight size={20} color="#94a3b8" />
              </div>
            ))}
          </div>
          <button onClick={() => setStep("login")} style={{ marginTop: "2rem", background: "transparent", border: "none", color: "#64748b", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ArrowLeft size={16} /> Volver a buscar
          </button>
        </div>
      </div>
    );
  }

  // REPORT VIEW (Matches the Second Image Style)
  return (
    <div style={{ background: "white", minHeight: "100vh", padding: "2rem 1rem", color: "black", fontFamily: "Arial, sans-serif" }}>
      <div style={reportContainer}>
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

        {/* Relación Mensual - Last 15 records (simulating the 15 years table) */}
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

        <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
            <div style={{ fontSize: "0.75rem", color: "red", fontWeight: 700 }}>
                Información Actualizada al: {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })} a las {new Date().toLocaleTimeString()}
            </div>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
                <button onClick={exportToExcel} style={actionButton}>
                    <Download size={14} /> Descargar Excel
                </button>
                <button onClick={() => window.print()} style={actionButton}>
                    <FileText size={14} /> Imprimir Reporte
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
const containerStyle = {
  minHeight: "100vh",
  background: "#1e40af", // Blue IVSS style
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
} as any;

const loginModalStyle = {
  width: "100%",
  maxWidth: "450px",
  background: "#3b82f6", // Lighter blue
  borderRadius: "15px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  position: "relative",
  overflow: "hidden",
  border: "2px solid rgba(255,255,255,0.2)",
} as any;

const modalHeader = {
  padding: "0.75rem 1.25rem",
  background: "rgba(0,0,0,0.1)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
} as any;

const modalBody = {
  padding: "2rem",
  position: "relative",
  zIndex: 2,
} as any;

const modalTitle = {
  fontSize: "1.75rem",
  fontWeight: 900,
  color: "white",
  marginBottom: "1.5rem",
  borderBottom: "1px solid rgba(255,255,255,0.3)",
  paddingBottom: "0.5rem",
} as any;

const formGroup = {
  marginBottom: "1.25rem",
} as any;

const modalLabel = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 900,
  color: "white",
  marginBottom: "0.5rem",
} as any;

const modalInput = {
  flex: 1,
  padding: "0.6rem 1rem",
  borderRadius: "5px",
  border: "2px solid white",
  background: "white",
  fontSize: "1rem",
  fontWeight: 700,
} as any;

const modalSelectPrefix = {
  padding: "0.6rem",
  borderRadius: "5px",
  border: "2px solid white",
  background: "white",
  fontWeight: 700,
} as any;

const modalSelect = {
  flex: 1,
  padding: "0.6rem",
  borderRadius: "5px",
  border: "2px solid white",
  background: "white",
  fontWeight: 700,
  fontSize: "0.8rem",
} as any;

const modalButton = {
  background: "#dbeafe",
  color: "#1e40af",
  border: "2px solid #1e40af",
  padding: "0.6rem 2.5rem",
  borderRadius: "4px",
  fontSize: "1rem",
  fontWeight: 900,
  cursor: "pointer",
} as any;

const modalLogoWatermark = {
  position: "absolute",
  bottom: "-20px",
  right: "20px",
  fontSize: "8rem",
  fontWeight: 900,
  color: "rgba(255,255,255,0.05)",
  zIndex: 1,
  pointerEvents: "none",
} as any;

const accountCardStyle = {
  background: "white",
  padding: "1.5rem",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  cursor: "pointer",
  transition: "all 0.2s",
  border: "1px solid #e2e8f0",
} as any;

const accountCardIcon = {
  width: "50px",
  height: "50px",
  background: "#dbeafe",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1e40af",
} as any;

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
