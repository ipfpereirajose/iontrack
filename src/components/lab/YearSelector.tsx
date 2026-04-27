"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function YearSelector({ selectedYear }: { selectedYear: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const years = ["2026", "2025", "2024"];

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn"
        style={{
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "0.75rem 1.25rem",
          color: "var(--text-main)",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
          transition: "all 0.2s",
          minWidth: "140px",
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={18} color="var(--primary-teal)" />
          <span>Año {selectedYear}</span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
            transition: "transform 0.2s",
            color: "var(--text-muted)"
          }} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)} 
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
          />
          <div
            className="glass-card"
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              left: 0,
              right: 0,
              zIndex: 100,
              padding: "0.5rem",
              minWidth: "140px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              animation: "modal-appear 0.2s ease-out"
            }}
          >
            {years.map((year) => (
              <button
                key={year}
                onClick={() => handleYearChange(year)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: selectedYear === year ? "rgba(0, 168, 181, 0.08)" : "transparent",
                  color: selectedYear === year ? "var(--primary-teal)" : "var(--text-main)",
                  fontWeight: selectedYear === year ? 800 : 600,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.1s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
                onMouseEnter={(e) => {
                  if (selectedYear !== year) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (selectedYear !== year) e.currentTarget.style.background = "transparent";
                }}
              >
                Año {year}
                {selectedYear === year && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary-teal)" }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
