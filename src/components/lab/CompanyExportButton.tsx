"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface Company {
  tax_id: string;
  name: string;
  address: string;
  company_code: string;
  sector?: string;
}

export default function CompanyExportButton({ companies }: { companies: Company[] }) {
  const handleExport = () => {
    if (!companies || companies.length === 0) return;

    const data = companies.map((c) => ({
      RIF: c.tax_id,
      ENTIDAD: c.name,
      DIRECCIÓN: c.address,
      SECTOR: c.sector || "General",
      CODIGO_INSTALACION: c.company_code,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relacion_Sedes");
    
    // Generate filename with current date
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Relacion_Sedes_IonTrack_${date}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="btn btn-secondary"
      style={{
        padding: "0.75rem 1.5rem",
        borderRadius: "12px",
        fontWeight: 700,
        gap: "0.5rem",
      }}
    >
      <Download size={18} />
      Exportar IDs de Sedes
    </button>
  );
}
