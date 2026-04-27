"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  ShieldCheck,
  ClipboardList,
  Send,
} from "lucide-react";
import RegulatoryReportButton from "@/components/lab/RegulatoryReportButton";
import MonthlyPDFReportButton from "@/components/lab/MonthlyPDFReportButton";

export default function LabReportsPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
          }}
        >
          Reportes y Certificados
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Gestión de reportes oficiales para clientes y autoridades reguladoras.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "2.5rem",
        }}
      >
        {/* LEFT: REGULATORY REPORTS */}
        <section className="clean-panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                padding: "0.75rem",
                background: "rgba(0, 168, 181, 0.1)",
                borderRadius: "12px",
              }}
            >
              <ShieldCheck size={24} color="var(--primary-teal)" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                Reportes para la Autoridad
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Exportación masiva de dosis mensuales.
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              padding: "1.5rem",
              borderRadius: "16px",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div className="input-group">
                <label style={labelStyle}>Mes</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  style={inputStyle}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("es", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label style={labelStyle}>Año</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  style={inputStyle}
                >
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

              <MonthlyPDFReportButton 
                month={month} 
                year={year} 
              />
              <RegulatoryReportButton
                month={month}
                year={year}
                tenantName="Mi Laboratorio"
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                Este reporte incluye toda la información de laboratorios,
                empresas, OSR y TOEs con sus respectivas dosis vida.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT: QUICK ACTIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section className="clean-panel">
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                marginBottom: "1.5rem",
              }}
            >
              Otros Documentos
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <button
                className="btn"
                style={{ background: "#f1f5f9", justifyContent: "flex-start" }}
              >
                <ClipboardList size={18} color="var(--primary-teal)" />
                Certificados Individuales
              </button>
              <button
                className="btn"
                style={{ background: "#f1f5f9", justifyContent: "flex-start" }}
              >
                <FileText size={18} color="var(--primary-teal)" />
                Estadísticas por Empresa
              </button>
              <button
                className="btn"
                style={{ background: "#f1f5f9", justifyContent: "flex-start" }}
              >
                <Send size={18} color="var(--primary-teal)" />
                Notificar a Autoridad (Email)
              </button>
            </div>
          </section>

          <div
            className="clean-panel"
            style={{ background: "var(--primary-dark)", color: "white" }}
          >
            <h4 style={{ fontWeight: 800, marginBottom: "0.5rem" }}>
              Recordatorio
            </h4>
            <p style={{ fontSize: "0.8rem", opacity: 0.8, lineHeight: "1.5" }}>
              Los reportes deben ser enviados a la autoridad reguladora dentro
              de los primeros 5 días de cada mes después de la carga masiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 900,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  marginBottom: "0.5rem",
} as any;
const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "white",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "0.9rem",
  fontWeight: 700,
} as any;
