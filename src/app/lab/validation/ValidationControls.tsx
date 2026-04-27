
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Filter, Loader2 } from "lucide-react";

interface ValidationControlsProps {
  approveAllAction: (month?: number, year?: number) => Promise<{ success: number }>;
  pendingCount: number;
}

export default function ValidationControls({ approveAllAction, pendingCount }: ValidationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const currentMonth = searchParams.get("month") || "";
  const currentYear = searchParams.get("year") || "";

  const months = [
    { v: "1", n: "Enero" }, { v: "2", n: "Febrero" }, { v: "3", n: "Marzo" },
    { v: "4", n: "Abril" }, { v: "5", n: "Mayo" }, { v: "6", n: "Junio" },
    { v: "7", n: "Julio" }, { v: "8", n: "Agosto" }, { v: "9", n: "Septiembre" },
    { v: "10", n: "Octubre" }, { v: "11", n: "Noviembre" }, { v: "12", n: "Diciembre" }
  ];

  const handleFilter = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(key, val);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  const handleApproveAll = async () => {
    const label = currentMonth ? "este periodo" : "TODOS los registros pendientes";
    if (!confirm(`¿Está seguro de aprobar ${label} (${pendingCount})?`)) return;

    setLoading(true);
    try {
      const res = await approveAllAction(
        currentMonth ? parseInt(currentMonth) : undefined, 
        currentYear ? parseInt(currentYear) : undefined
      );
      alert(`Se han aprobado ${res.success} registros exitosamente.`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: "1.5rem",
      gap: "1rem",
      flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
          <Filter size={18} />
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Filtrar Periodo:</span>
        </div>
        
        <select 
          value={currentMonth} 
          onChange={(e) => handleFilter("month", e.target.value)}
          className="glass-card"
          style={{ padding: "0.5rem 1rem", borderRadius: "10px", border: "1px solid var(--border)", cursor: "pointer" }}
        >
          <option value="">Todos los meses</option>
          {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
        </select>

        <select 
          value={currentYear} 
          onChange={(e) => handleFilter("year", e.target.value)}
          className="glass-card"
          style={{ padding: "0.5rem 1rem", borderRadius: "10px", border: "1px solid var(--border)", cursor: "pointer" }}
        >
          <option value="">Todos los años</option>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {pendingCount > 0 && (
        <button
          onClick={handleApproveAll}
          disabled={loading}
          className="btn-primary"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            padding: "0.75rem 1.5rem",
            fontSize: "0.875rem",
            background: "var(--state-safe)"
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          {currentMonth ? `Aprobar periodo (${pendingCount})` : `Aprobar todos los pendientes (${pendingCount})`}
        </button>
      )}
    </div>
  );
}
