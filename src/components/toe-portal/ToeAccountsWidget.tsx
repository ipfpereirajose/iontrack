"use client";

import { Building2, ArrowRight, ArrowLeft } from "lucide-react";

export default function ToeAccountsWidget({ data, ci, setSelectedAccount, setStep }: any) {
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

const containerStyle = {
  minHeight: "100vh",
  background: "#1e40af", // Blue IVSS style
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
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
