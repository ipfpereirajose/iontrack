"use client";

import * as XLSX from "xlsx";
import { Download } from "lucide-react";

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
  const downloadReport = async () => {
    // 1. Fetch all approved doses for this lab and period
    // In a real app, this would be a server action
    const response = await fetch(
      `/api/reports/regulatory?month=${month}&year=${year}&limit=5000`, // Fetch all for excel for now
    );
    const result = await response.json();
    const data = result.data || [];

    if (!data || data.length === 0) {
      alert("No hay dosis registradas para este periodo.");
      return;
    }

    // 2. Format for Regulator
    const formatted = data.map((d: any) => ({
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

    // 3. Generate Excel
    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte_Regulador");
    XLSX.writeFile(wb, `Reporte_Autoridad_${month}_${year}.xlsx`);
  };

  return (
    <button
      onClick={downloadReport}
      className="btn btn-secondary"
      style={{ gap: "0.75rem" }}
    >
      <Download size={18} />
      Reporte para Autoridad Reguladora
    </button>
  );
}
