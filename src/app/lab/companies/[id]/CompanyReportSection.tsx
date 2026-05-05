"use client";

import { useState } from "react";
import { FileText, CalendarDays } from "lucide-react";
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
  padding: "0.6rem 1rem",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "var(--text-main)",
  cursor: "pointer",
  minWidth: "130px",
} as React.CSSProperties;

export default function CompanyReportSection({ companyId }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  return (
    <div
      className="glass-panel"
      style={{
        padding: "1.75rem 2rem",
        marginBottom: "2rem",
        border: "1px solid rgba(0, 168, 181, 0.25)",
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        flexWrap: "wrap",
      }}
    >
      {/* Icon + Label */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: "1 1 200px" }}>
        <div
          style={{
            padding: "0.6rem",
            background: "rgba(0, 168, 181, 0.12)",
            borderRadius: "10px",
            color: "var(--primary-teal)",
          }}
        >
          <FileText size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>Informe Mensual Dosimétrico</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Genera el informe oficial por empresa en formato PDF
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <CalendarDays size={16} color="var(--text-muted)" />
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

      {/* PDF Button */}
      <div style={{ minWidth: "230px" }}>
        <CompanyMonthlyPDFButton
          companyId={companyId}
          month={month}
          year={year}
        />
      </div>
    </div>
  );
}
