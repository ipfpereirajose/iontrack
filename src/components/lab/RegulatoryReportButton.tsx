"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Download, Loader2 } from "lucide-react";

interface Props {
  month: number;
  year: number;
  tenantName: string;
}

export default function RegulatoryReportButton({
  month,
  year,
  tenantName,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const downloadReport = async () => {
    try {
      setLoading(true);
      setProgress(0);
      setCurrentCount(0);
      setTotalCount(0);

      let allData: any[] = [];
      const batchSize = 1000;
      let offset = 0;
      let total = 0;

      // 1. Initial fetch to get total
      const initialRes = await fetch(
        `/api/reports/regulatory?month=${month}&year=${year}&limit=${batchSize}&offset=0`
      );
      const initialResult = await initialRes.json();
      
      if (initialResult.error) throw new Error(initialResult.error);
      
      allData = initialResult.data || [];
      total = initialResult.total || 0;
      setTotalCount(total);
      setCurrentCount(allData.length);

      if (total === 0) {
        alert("No hay dosis registradas para este periodo.");
        setLoading(false);
        return;
      }

      setProgress(Math.floor((allData.length / total) * 100));

      // 2. Batch extraction
      while (allData.length < total) {
        offset += batchSize;
        const res = await fetch(
          `/api/reports/regulatory?month=${month}&year=${year}&limit=${batchSize}&offset=${offset}`
        );
        const result = await res.json();
        if (result.data) {
          allData = [...allData, ...result.data];
          setCurrentCount(allData.length);
          setProgress(Math.floor((allData.length / total) * 100));
        } else {
          break;
        }
      }

      // 3. Format for Regulator
      const formatted = allData.map((d: any) => ({
        // INFORMACION LABORATORIO
        LABORATORIO: d.lab_name,
        "RIF LAB": d.lab_rif,

        // INFORMACION EMPRESA
        EMPRESA: d.company_name,
        "RIF EMPRESA": d.company_rif,
        "DIRECCION EMPRESA": d.company_address,
        "OSR RESPONSABLE": d.osr_name,
        "CI OSR": d.osr_ci,
        "CELULAR OSR": d.osr_phone,

        // INFORMACION TOE
        "CEDULA TOE": d.worker_ci,
        APELLIDOS: d.worker_last_name,
        NOMBRES: d.worker_first_name,

        // REPORTES DE DOSIS (MES)
        "HP(10) MES": d.hp10,
        "HP(0.07) MES": d.hp007,
        "HP(3) MES": d.hp3,
        "NEUTRONES MES": d.hp10_neu,
        "EXTREMIDADES MES": d.hp007_ext,

        // REGISTRO VIDA
        "REGISTRO VIDA ACUMULADO": d.life_record,

        PERIODO: `${month}/${year}`,
        OBSERVACION: d.observacion,
      }));

      // 4. Generate Excel
      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte_Regulador");
      XLSX.writeFile(wb, `Reporte_Autoridad_${month}_${year}.xlsx`);
      
      setLoading(false);
      setProgress(0);
    } catch (error: any) {
      console.error(error);
      alert("Error al generar reporte: " + error.message);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={downloadReport}
      disabled={loading}
      className="btn btn-secondary"
      style={{ 
        gap: "0.75rem", 
        width: "100%", 
        justifyContent: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Procesando {currentCount} de {totalCount} registros... ({progress}%)
          <div 
            style={{ 
              position: "absolute", 
              bottom: 0, 
              left: 0, 
              height: "3px", 
              background: "var(--primary)", 
              width: `${progress}%`,
              transition: "width 0.2s ease"
            }} 
          />
        </>
      ) : (
        <>
          <Download size={18} />
          Reporte para Autoridad Reguladora (Excel)
        </>
      )}
    </button>
  );
}
