"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  data: any[];
  companyName: string;
}

export default function ExportButton({ data, companyName }: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Prepare data for Excel
    const exportData = data.map((d) => ({
      Periodo: `${d.month.toString().padStart(2, "0")}/${d.year}`,
      Trabajador: `${d.toe_workers.first_name} ${d.toe_workers.last_name}`,
      Cédula: d.toe_workers.ci,
      "Dosis Hp10 (mSv)": d.hp10.toFixed(4),
      Estatus: "CERTIFICADO",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // Periodo
      { wch: 30 }, // Trabajador
      { wch: 15 }, // Cédula
      { wch: 20 }, // Dosis
      { wch: 15 }, // Estatus
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial_Dosimetrico");

    // Save file
    const fileName = `Historial_Dosis_${companyName.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button
      onClick={handleExport}
      className="btn btn-primary"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "#a855f7",
        color: "white",
        border: "none",
        padding: "0.75rem 1.5rem",
        borderRadius: "12px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      <Download size={18} />
      Exportar Historial (Excel)
    </button>
  );
}
