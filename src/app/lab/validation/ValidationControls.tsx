
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Filter, Loader2, Sparkles } from "lucide-react";
import { approveBatch, finishBulkApproval } from "./actions";

interface ValidationControlsProps {
  pendingCount: number;
}

export default function ValidationControls({ pendingCount }: ValidationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

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
    if (!confirm(`¿Desea iniciar el procesamiento masivo de ${pendingCount} registros?`)) return;

    setLoading(true);
    setProgress(0);
    let processedTotal = 0;
    const totalToProcess = pendingCount;

    try {
      const monthNum = currentMonth ? parseInt(currentMonth) : undefined;
      const yearNum = currentYear ? parseInt(currentYear) : undefined;

      while (processedTotal < totalToProcess) {
        setCurrentStep(`Procesando bloque: ${processedTotal} de ${totalToProcess}...`);
        
        const res = await approveBatch(monthNum, yearNum);
        
        if (res.success === 0 && res.remaining === 0) break;
        
        processedTotal += res.success;
        const newProgress = Math.min((processedTotal / totalToProcess) * 100, 100);
        setProgress(newProgress);

        if (res.remaining === 0) break;
      }

      setCurrentStep("Finalizando auditoría...");
      await finishBulkApproval(monthNum, yearNum, processedTotal);
      
      alert(`Los registros han sido aprobados exitosamente.`);
      router.refresh();
    } catch (err: any) {
      alert(`Error en el procesamiento: ${err.message}`);
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentStep("");
    }
  };

  return (
    <div className="controls-container">
      <div className="filter-group">
        <div className="filter-label">
          <Filter size={18} />
          <span>Filtrar Periodo:</span>
        </div>
        
        <select 
          value={currentMonth} 
          onChange={(e) => handleFilter("month", e.target.value)}
          className="glass-select"
        >
          <option value="">Todos los meses</option>
          {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
        </select>

        <select 
          value={currentYear} 
          onChange={(e) => handleFilter("year", e.target.value)}
          className="glass-select"
        >
          <option value="">Todos los años</option>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="action-group">
        {pendingCount > 0 && !loading && (
          <button onClick={handleApproveAll} className="btn-approve-all">
            <CheckCircle2 size={18} />
            <span>Aprobar todos los pendientes ({pendingCount})</span>
          </button>
        )}

        {loading && (
          <div className="progress-container">
            <div className="progress-header">
              <div className="progress-info">
                <Loader2 className="animate-spin" size={16} />
                <span>{currentStep}</span>
              </div>
              <span className="progress-percentage">{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%` }}
              >
                <div className="progress-bar-glow"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .controls-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1.5rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .filter-group {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .glass-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.6rem 1rem;
          border-radius: 12px;
          outline: none;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .glass-select:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--primary-teal);
        }

        .btn-approve-all {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1.75rem;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }

        .btn-approve-all:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
          filter: brightness(1.1);
        }

        .progress-container {
          min-width: 350px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--primary-teal);
        }

        .progress-percentage {
          font-weight: 800;
          color: white;
          font-family: monospace;
          font-size: 1rem;
        }

        .progress-bar-bg {
          height: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          border-radius: 20px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .progress-bar-glow {
          position: absolute;
          top: 0;
          right: 0;
          width: 30px;
          height: 100%;
          background: white;
          filter: blur(8px);
          opacity: 0.3;
          animation: scan 1.5s infinite linear;
        }

        @keyframes scan {
          from { transform: translateX(-100px); }
          to { transform: translateX(400px); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .controls-container {
            flex-direction: column;
            align-items: stretch;
          }
          .progress-container {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
