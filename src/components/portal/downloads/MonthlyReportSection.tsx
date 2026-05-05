"use client";

import { useState } from "react";
import { FileDown, CalendarDays } from "lucide-react";
import CompanyMonthlyPDFButton from "@/components/lab/CompanyMonthlyPDFButton";

const MONTHS = [
  { v: 1, l: "Enero" }, { v: 2, l: "Febrero" }, { v: 3, l: "Marzo" },
  { v: 4, l: "Abril" }, { v: 5, l: "Mayo" }, { v: 6, l: "Junio" },
  { v: 7, l: "Julio" }, { v: 8, l: "Agosto" }, { v: 9, l: "Septiembre" },
  { v: 10, l: "Octubre" }, { v: 11, l: "Noviembre" }, { v: 12, l: "Diciembre" },
];

const YEARS = [2023, 2024, 2025, 2026];

interface Props {
  companyId: string;
}

const selectStyle = {
  padding: "0.6rem 0.8rem",
  background: "#f8fafc",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#1e293b",
  cursor: "pointer",
  flex: 1
} as React.CSSProperties;

export default function MonthlyReportSection({ companyId }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  return (
    <div className="clean-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ padding: "1rem", background: "rgba(168, 85, 247, 0.1)", borderRadius: "15px", width: "fit-content" }}>
        <FileDown size={28} color="#a855f7" />
      </div>
      <div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Informe Mensual Oficial
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
          Reporte dosimétrico consolidado (Formato Physion) para los órganos reguladores.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          style={selectStyle}
        >
          {MONTHS.map((m) => (
            <option key={m.v} value={m.v}>{m.l}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          style={selectStyle}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <CompanyMonthlyPDFButton
        companyId={companyId}
        month={month}
        year={year}
      />
    </div>
  );
}
