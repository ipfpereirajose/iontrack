"use client";

import { useState, useEffect } from "react";

interface BirthDateSelectorProps {
  selectStyle: React.CSSProperties;
}

export default function BirthDateSelector({ selectStyle }: BirthDateSelectorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <select required name="birth_day" style={{ ...selectStyle, flex: 1, padding: "0.875rem 0.5rem" }} disabled>
          <option value="">Día</option>
        </select>
        <select required name="birth_month" style={{ ...selectStyle, flex: 2, padding: "0.875rem 0.5rem" }} disabled>
          <option value="">Mes</option>
        </select>
        <select required name="birth_year" style={{ ...selectStyle, flex: 1, padding: "0.875rem 0.5rem" }} disabled>
          <option value="">Año</option>
        </select>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <select required name="birth_day" style={{ ...selectStyle, flex: 1, padding: "0.875rem 0.5rem" }}>
        <option value="">Día</option>
        {Array.from({ length: 31 }, (_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}</option>
        ))}
      </select>
      <select required name="birth_month" style={{ ...selectStyle, flex: 2, padding: "0.875rem 0.5rem" }}>
        <option value="">Mes</option>
        {[
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ].map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>
      <select required name="birth_year" style={{ ...selectStyle, flex: 1, padding: "0.875rem 0.5rem" }}>
        <option value="">Año</option>
        {Array.from({ length: 70 }, (_, i) => {
          const y = new Date().getFullYear() - 18 - i;
          return <option key={y} value={y}>{y}</option>;
        })}
      </select>
    </div>
  );
}
