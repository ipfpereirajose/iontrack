"use client";

import { useState, useEffect } from "react";
import { TrendingUp, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import DoseChart from "./DoseChart";
import { fetchDoseChunk } from "@/app/lab/actions";

interface InteractiveCompanyTrendChartProps {
  workerIds: string[];
  targetYear: number;
}

export default function InteractiveCompanyTrendChart({ workerIds, targetYear }: InteractiveCompanyTrendChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const loadData = async () => {
    if (workerIds.length === 0) return;
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    const allDoses: any[] = [];
    const BATCH_SIZE = 100;
    
    try {
      for (let i = 0; i < workerIds.length; i += BATCH_SIZE) {
        const chunk = workerIds.slice(i, i + BATCH_SIZE);
        const chunkDoses = await fetchDoseChunk(chunk, targetYear);
        allDoses.push(...chunkDoses);
        setProgress(Math.min(100, Math.round(((i + BATCH_SIZE) / workerIds.length) * 100)));
      }

      // Process for Chart (TOTALS for Companies)
      const processedData = months.map((name, index) => {
        const monthNum = index + 1;
        const monthDoses = allDoses.filter(d => d.month === monthNum);
        
        const approvedTotal = monthDoses.filter(d => d.status === 'approved').reduce((acc, curr) => acc + (Number(curr.hp10) || 0), 0);
        const pendingTotal = monthDoses.filter(d => d.status === 'pending').reduce((acc, curr) => acc + (Number(curr.hp10) || 0), 0);
        
        return {
          name,
          approved: parseFloat(approvedTotal.toFixed(4)),
          pending: parseFloat(pendingTotal.toFixed(4)),
          projected: 0
        };
      });

      setChartData(processedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetYear]);

  return (
    <div className="clean-panel" style={{ minHeight: "450px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <TrendingUp size={20} color="var(--primary-teal)" />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Carga Dosimétrica Total (<span style={{ textTransform: "none" }}>mSv</span>)</h2>
        </div>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="btn"
          style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {loading ? `Cargando ${progress}%` : "Refrescar Gráfica"}
        </button>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid var(--state-danger)", borderRadius: "12px", padding: "1rem", color: "var(--state-danger)", display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <AlertCircle size={18} />
          <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>Error al cargar datos: {error}</p>
        </div>
      )}

      {loading && chartData.length === 0 ? (
        <div style={{ height: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
          <Loader2 size={48} className="animate-spin" style={{ marginBottom: "1rem", opacity: 0.2 }} />
          <p style={{ fontWeight: 600 }}>Procesando bloques de datos...</p>
          <div style={{ width: "200px", height: "4px", background: "var(--border)", borderRadius: "2px", marginTop: "1rem", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "var(--primary-teal)", transition: "width 0.3s ease" }} />
          </div>
        </div>
      ) : (
        <DoseChart data={chartData} />
      )}
      
      <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
        <span>* Valores expresados en mSv totales acumulados por todas las empresas.</span>
        <span>Año Fiscal: {targetYear}</span>
      </div>
    </div>
  );
}
