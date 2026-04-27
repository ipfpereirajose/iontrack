"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle, FileText, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  month: number;
  year: number;
}

export default function MonthlyPDFReportButton({ month, year }: Props) {
  const [status, setStatus] = useState<"idle" | "extracting" | "converting" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const generatePDF = async () => {
    try {
      setStatus("extracting");
      setProgress(5);
      setErrorMsg("");

      let allData: any[] = [];
      const batchSize = 100;
      let offset = 0;
      let total = 0;

      // 1. Initial fetch to get total
      const initialRes = await fetch(`/api/reports/regulatory?month=${month}&year=${year}&limit=${batchSize}&offset=0`);
      const initialResult = await initialRes.json();
      
      if (initialResult.error) throw new Error(initialResult.error);
      
      allData = initialResult.data;
      total = initialResult.total;

      if (total === 0) {
        alert("No hay datos para generar el reporte en este periodo.");
        setStatus("idle");
        return;
      }

      setProgress(Math.floor((allData.length / total) * 50));

      // 2. Batch extraction
      while (allData.length < total) {
        offset += batchSize;
        const res = await fetch(`/api/reports/regulatory?month=${month}&year=${year}&limit=${batchSize}&offset=${offset}`);
        const result = await res.json();
        if (result.data) {
          allData = [...allData, ...result.data];
          setProgress(Math.floor((allData.length / total) * 50) + 5);
        } else {
          break;
        }
      }

      // 3. Conversion to PDF
      setStatus("converting");
      setProgress(60);

      const doc = new jsPDF("l", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(18);
      doc.setTextColor(0, 128, 128);
      doc.text("REPORTE MENSUAL DE VIGILANCIA RADIOLÓGICA", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Periodo: ${month}/${year} | Laboratorio: ${allData[0]?.lab_name || "N/A"}`, pageWidth / 2, 28, { align: "center" });

      setProgress(80);

      const tableData = allData.map((d, index) => [
        index + 1,
        d.company_name,
        d.worker_ci,
        `${d.worker_last_name}, ${d.worker_first_name}`,
        d.hp10?.toFixed(3) || "0.000",
        d.hp3?.toFixed(3) || "0.000",
        d.hp007?.toFixed(3) || "0.000",
        d.life_record?.toFixed(3) || "0.000"
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["#", "Empresa", "Cédula", "Nombre", "Hp(10)", "Hp(3)", "Hp(0.07)", "Acum. Vida"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [0, 128, 128] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 50 },
          2: { cellWidth: 25 },
        }
      });

      setProgress(100);
      doc.save(`Reporte_Mensual_IONTRACK_${month}_${year}.pdf`);
      setStatus("done");

      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al generar PDF");
      setStatus("error");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {status === "idle" && (
        <button
          onClick={generatePDF}
          className="btn"
          style={{
            background: "var(--primary-teal)",
            color: "white",
            width: "100%",
            gap: "0.75rem",
            justifyContent: "center",
            padding: "1rem"
          }}
        >
          <FileText size={20} />
          Generar Reporte Mensual PDF
        </button>
      )}

      {(status === "extracting" || status === "converting") && (
        <div className="glass-panel" style={{ padding: "1.5rem", border: "1px solid var(--primary-teal)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <Loader2 size={24} className="animate-spin" color="var(--primary-teal)" />
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>
                {status === "extracting" ? "Extrayendo Datos por Bloques..." : "Convirtiendo a PDF..."}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                No cierre esta ventana
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontWeight: 900, color: "var(--primary-teal)" }}>
              {progress}%
            </div>
          </div>
          <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
            <div 
              style={{ 
                height: "100%", 
                background: "var(--primary-teal)", 
                width: `${progress}%`,
                transition: "width 0.3s ease"
              }} 
            />
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="glass-panel" style={{ padding: "1.5rem", background: "rgba(34, 197, 94, 0.05)", border: "1px solid #22c55e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <CheckCircle size={24} color="#22c55e" />
            <div>
              <div style={{ fontWeight: 800, color: "#22c55e" }}>¡Reporte Generado!</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>La descarga comenzará automáticamente</div>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="glass-panel" style={{ padding: "1.5rem", background: "rgba(239, 68, 68, 0.05)", border: "1px solid #ef4444" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <AlertCircle size={24} color="#ef4444" />
            <div>
              <div style={{ fontWeight: 800, color: "#ef4444" }}>Error en Generación</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{errorMsg}</div>
            </div>
          </div>
          <button 
            onClick={() => setStatus("idle")}
            style={{ marginTop: "1rem", fontSize: "0.7rem", fontWeight: 800, color: "var(--primary-teal)", border: "none", background: "none", cursor: "pointer" }}
          >
            REINTENTAR
          </button>
        </div>
      )}
    </div>
  );
}
