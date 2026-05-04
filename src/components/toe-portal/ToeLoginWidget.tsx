"use client";

import { X } from "lucide-react";

export default function ToeLoginWidget({
  ci,
  setCi,
  day,
  setDay,
  month,
  setMonth,
  year,
  setYear,
  handleLogin,
  loading,
  error,
}: any) {
  const formatCI = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) return "";
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleCIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 9) setCi(raw);
  };

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
                  value={formatCI(ci)} 
                  onChange={handleCIChange} 
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
                    <option key={i+1} value={m}>{m}</option>
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
