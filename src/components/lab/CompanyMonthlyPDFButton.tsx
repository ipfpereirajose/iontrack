"use client";

import { useState } from "react";
import { FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  companyId: string;
  month: number;
  year: number;
}

const MONTH_NAMES_ES = [
  "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function CompanyMonthlyPDFButton({ companyId, month, year }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const generatePDF = async () => {
    try {
      setStatus("loading");
      setErrorMsg("");

      const res = await fetch(
        `/api/reports/company-monthly?company_id=${companyId}&month=${month}&year=${year}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener datos");

      const { lab, company, workers } = data;

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const PW = doc.internal.pageSize.getWidth();
      const PH = doc.internal.pageSize.getHeight();

      const DARK_RED = [180, 0, 0] as [number, number, number];
      const BLACK = [0, 0, 0] as [number, number, number];
      const WHITE = [255, 255, 255] as [number, number, number];
      const DARK_BLUE = [0, 68, 124] as [number, number, number];

      // ─────────────────────────────────────────────
      // HEADER (Blue top bar)
      // ─────────────────────────────────────────────
      doc.setFillColor(...DARK_BLUE);
      doc.rect(0, 0, PW, 12, "F");

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);
      doc.text((lab.name || "PHYSION TECNOLOGÍA NUCLEAR").toUpperCase() + ".", 4, 8);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      const subtitle = "SERVICIO DE MONITORIZACIÓN DE LA RADIACIÓN EXTERNA POR OSL.  DOSIS EQUIVALENTE  PERSONAL  Hp (d) EN mSv  INFORME MENSUAL";
      doc.text(subtitle, PW - 5, 7.5, { align: "right" });

      // ─────────────────────────────────────────────
      // LOGO
      // ─────────────────────────────────────────────
      const logoToUse = lab.logo_url || "/physion-logo.png";
      const base64 = await loadImageAsBase64(logoToUse);
      if (base64) {
        try {
          doc.addImage(base64, "PNG", 4, 14, 30, 20);
        } catch (e) { console.error(e); }
      }

      // ─────────────────────────────────────────────
      // DASHBOARD MOCKS (Optional, but included for fidelity to screenshot if desired)
      // ─────────────────────────────────────────────
      doc.setFontSize(8);
      doc.setTextColor(...BLACK);
      doc.setFont("helvetica", "normal");
      doc.text("Nombre", 40, 17);
      doc.text("Todas", 40, 23);
      doc.setDrawColor(200);
      doc.line(40, 24, 110, 24);

      doc.text("VER MES", 120, 17);
      doc.setFont("helvetica", "bold");
      doc.text(`${MONTH_NAMES_ES[month]} ${year}`, 120, 23);
      doc.line(120, 24, 180, 24);

      const COL_START_Y = 38;
      const COL1_X = 4;   const COL1_W = 95;
      const COL2_X = 103; const COL2_W = 118;
      const COL3_X = 225; const COL3_W = PW - 225 - 4;

      // ─────────────────────────────────────────────
      // COL 1: DATOS DEL CLIENTE
      // ─────────────────────────────────────────────
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(150);
      doc.roundedRect(COL1_X, COL_START_Y, COL1_W, 58, 3, 3, "S");
      
      doc.setFillColor(235, 137, 145); // Pinkish red bar as per image
      doc.rect(COL1_X + 0.3, COL_START_Y + 7, COL1_W - 0.6, 3, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DEL CLIENTE", COL1_X + COL1_W / 2, COL_START_Y + 5, { align: "center" });

      const drawField = (label: string, value: string, x: number, y: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text(label + ":", x, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(value, x + 42, y);
      };

      let fy = COL_START_Y + 15;
      drawField("CÓDIGO", company.company_code || "0153", COL1_X + 4, fy); fy += 5.5;
      drawField("DOSIMETRÍA CORRESPONDIENTE AL MES", `${MONTH_NAMES_ES[month]} ${year}`, COL1_X + 4, fy); fy += 5.5;
      drawField("RIF", company.tax_id || "J-00294315-7", COL1_X + 4, fy); fy += 5.5;
      drawField("EMPRESA", company.name || "EMPRESA", COL1_X + 4, fy); fy += 5.5;
      drawField("DEPARTAMENTO", company.departamento || "RADIOLOGIA", COL1_X + 4, fy); fy += 5.5;
      const fechaInicio = company.fecha_inicio_servicio ? new Date(company.fecha_inicio_servicio + "T00:00:00").toLocaleDateString("es-VE") : "N/A";
      drawField("FECHA DE INICIO DEL SERVICIO", fechaInicio, COL1_X + 4, fy); fy += 5.5;
      drawField("TIPO DE RADIACIÓN", company.tipo_radiacion || "PENETRANTE Y NO PENETRANTE", COL1_X + 4, fy); fy += 5.5;
      drawField("UBICACIÓN DEL DOSIMETRO", company.ubicacion_dosimetro || "TORAX", COL1_X + 4, fy);

      // ─────────────────────────────────────────────
      // COL 2: LEYENDA
      // ─────────────────────────────────────────────
      doc.roundedRect(COL2_X, COL_START_Y, COL2_W, 58, 3, 3, "S");
      doc.setFillColor(180, 0, 0); // Solid red bar
      doc.rect(COL2_X + 0.3, COL_START_Y + 7, COL2_W - 0.6, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("LEYENDA", COL2_X + COL2_W / 2, COL_START_Y + 5, { align: "center" });

      const L1 = [
        ["ND:", "NO DETECTABLE"],
        ["DD:", "DOSIMETRO OSL DETERIORADO:"],
        ["DR:", "DOSIMETRO OSL RETRASADO"],
        ["V:", "VACACIONES / AUSENTE"],
        ["DNU:", "DOSIMETRO OSL NO UTILIZADO"],
        ["SLD:", "SUPERÓ LÍMITE DE DOSIS"],
        ["DE:", "DOSÍMETRO EXTRAVIADO"],
      ];
      const L2 = [
        ["SRM:", "SUPERÓ NIVEL DE REFERENCIA MENSUAL"],
        ["SNI:", "SUPERÓ NIVEL DE INVESTIGACIÓN"],
        ["A:", "AMBIENTE H*10 MENSUAL"],
        ["Hp(10):", "DOSIS EQUIV. PERSON. A LA PROFUNDIDAD DE 10mm"],
        ["Hp(0,07):", "DOSIS EQUIV. PERSON. A LA PROFUNDIDAD DE 0,07mm"],
        ["Hp*(10):", "DOSIS EQUIV. AMBIENTAL"],
        ["DE:", "DOSÍMETRO EXTRAVIADO"],
        ["SS:", "SERVICIO SUSPENDIDO"],
      ];

      let ly = COL_START_Y + 16;
      L1.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.text(k, COL2_X + 4, ly);
        doc.setFont("helvetica", "normal"); doc.text(v, COL2_X + 15, ly);
        ly += 5.2;
      });
      ly = COL_START_Y + 16;
      L2.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.text(k, COL2_X + 60, ly);
        doc.setFont("helvetica", "normal"); doc.text(v, COL2_X + 75, ly, { maxWidth: 40 });
        ly += 5.2;
      });

      // ─────────────────────────────────────────────
      // COL 3: LIMITES NVC
      // ─────────────────────────────────────────────
      doc.roundedRect(COL3_X, COL_START_Y, COL3_W, 35, 3, 3, "S");
      doc.setFillColor(235, 137, 145);
      doc.rect(COL3_X + 0.3, COL_START_Y + 7, COL3_W - 0.6, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("LIM. DE DOSIS NVC 2259 VIGENTE", COL3_X + COL3_W / 2, COL_START_Y + 5, { align: "center" });

      autoTable(doc, {
        startY: COL_START_Y + 11,
        margin: { left: COL3_X + 2 },
        tableWidth: COL3_W - 4,
        head: [["", "TOE", "Pub."]],
        body: [
          ["DOSIS EFECTIVA mSv/a", "20", "1"],
          ["DOSIS EQUIVALENTE (mSv/a) para:", "", ""],
          ["CRISTALINO", "20", "15"],
          ["PIEL", "500", "50"],
        ],
        theme: "grid",
        styles: { fontSize: 7, fontStyle: "bold", textColor: [0, 0, 0] },
        headStyles: { fillColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, halign: "center" },
        columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 10, halign: "center" }, 2: { cellWidth: 10, halign: "center" } }
      });

      // ─────────────────────────────────────────────
      // LEYENDA SECUNDARIA (Niveles)
      // ─────────────────────────────────────────────
      const n2y = COL_START_Y + 38;
      doc.roundedRect(COL3_X, n2y, COL3_W, 55, 3, 3, "S");
      doc.setFillColor(235, 137, 145);
      doc.rect(COL3_X + 0.3, n2y + 7, COL3_W - 0.6, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text("LEYENDA", COL3_X + COL3_W / 2, n2y + 5, { align: "center" });

      const SL = [
        ["INCERTIDUMBRE:", "4%"],
        ["VALOR DE REFERENCIA DOSIS\nMENSUAL Hp (10):", "1.67 mSv"],
        ["VALOR DE REFERENCIA DOSIS\nMENSUAL Hp (0.07):", "42 mSv"],
        ["NIVEL DE REGISTRO\nSUGERIDO:", "0.10 mSv"],
        ["LIMITE DE DETECCIÓN DEL\nSISTEMA:", "0.10 mSv"],
        ["AUTORIZACIÓN DGEA:", "PIDS-DOS-COS-0001"],
      ];
      const SR = [
        ["NIVEL DE INVESTIGACIÓN\nSUGERIDO (NI) PARA\nHp(10):", "0.50 mSv"],
        ["NIVEL DE INVESTIGACIÓN\nSUGERIDO (NI) PARA\nHp(0.07):", "12 mSv"],
        ["AUTORIZACIÓN MPPS:", lab.mpps_auth || "0012-2022"],
      ];

      let sy = n2y + 13;
      SL.forEach(([k, v]) => {
        doc.setFontSize(6.5); doc.text(k, COL3_X + 2, sy); doc.text(v, COL3_X + 35, sy);
        sy += k.includes("\n") ? 8 : 5;
      });
      sy = n2y + 13;
      SR.forEach(([k, v]) => {
        doc.setFontSize(6.5); doc.text(k, COL3_X + 45, sy); doc.text(v, COL3_X + 45, sy + 7);
        sy += 12;
      });

      // ─────────────────────────────────────────────
      // WORKERS TABLE
      // ─────────────────────────────────────────────
      const workersTableY = 100;
      const tableBody = workers.map((w: any) => {
        const isAmbient = w.first_name.toUpperCase().startsWith("AMBIENTE");
        return [
          w.num, isAmbient ? "" : w.ci, `${w.last_name} ${w.first_name}`.trim(),
          isAmbient ? "" : w.sex, isAmbient ? "" : w.birth_date,
          w.mes_hp007, w.mes_hp10, isAmbient ? "" : "N/D", isAmbient ? "" : "N/D",
          isAmbient ? "" : w.vida_hp007, isAmbient ? "" : w.vida_hp10, w.observacion
        ];
      });

      autoTable(doc, {
        startY: workersTableY,
        margin: { left: 4, right: 4 },
        head: [["#", "Cedula", "Nombre", "SEXO", "Fecha de\nnacimiento", "Mes Actual.\nHp(0,07)", "Mes Actual.\nHp(10)", "Total en el\naño (Hp 0,07)", "Total en el\naño (Hp 10)", "Dosis Vida\nHp(0,07)", "Dosis Vida\nHp(10)", "Observacion"]],
        body: tableBody,
        theme: "grid",
        styles: { fontSize: 7, textColor: [0, 0, 0], halign: "center" },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [200, 200, 200] },
        columnStyles: {
          2: { halign: "left", cellWidth: 45 },
          9: { fillColor: [153, 204, 255], fontStyle: "bold" },
          10: { fillColor: [153, 204, 255], fontStyle: "bold" },
        },
        didParseCell: (hookData) => {
          const isAmbient = String(hookData.row.cells[2].raw).toUpperCase().includes("AMBIENTE");
          if (isAmbient && (hookData.column.index === 9 || hookData.column.index === 10)) {
            hookData.cell.styles.fillColor = [255, 255, 255];
          }
        }
      });

      // ─────────────────────────────────────────────
      // SIGNATURE
      // ─────────────────────────────────────────────
      const sigY = PH - 30;
      doc.line(PW - 70, sigY, PW - 10, sigY);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      const rep = `${lab.rep_title || "Ing."} ${lab.rep_first_name || ""} ${lab.rep_last_name || ""}`;
      doc.text(rep, PW - 40, sigY + 5, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("Firma", PW - 60, sigY + 10);
      doc.text(lab.rep_cargo || "Presidente", PW - 40, sigY + 10, { align: "center" });

      doc.save(`Informe_Mensual_Physion_${company.name}_${MONTH_NAMES_ES[month]}_${year}.pdf`);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al generar el informe");
      setStatus("error");
    }
  };

  return (
    <button onClick={generatePDF} className="btn btn-primary" style={{ gap: "0.75rem", width: "100%", justifyContent: "center", padding: "0.875rem" }}>
      {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
      {status === "loading" ? "Generando..." : status === "done" ? "¡Listo!" : status === "error" ? "Error" : "Generar Informe Mensual PDF"}
    </button>
  );
}
