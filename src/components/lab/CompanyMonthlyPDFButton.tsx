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

// Load external image as base64 for jsPDF
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

      // 1. Fetch data
      const res = await fetch(
        `/api/reports/company-monthly?company_id=${companyId}&month=${month}&year=${year}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener datos");

      const { lab, company, workers } = data;

      // 2. Create PDF landscape A4
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const PW = doc.internal.pageSize.getWidth();   // 297
      const PH = doc.internal.pageSize.getHeight();  // 210

      // ─────────────────────────────────────────────
      // COLOR PALETTE
      // ─────────────────────────────────────────────
      const DARK_RED   = [180, 0, 0] as [number, number, number];
      const MID_GRAY   = [100, 100, 100] as [number, number, number];
      const LIGHT_GRAY = [220, 220, 220] as [number, number, number];
      const YELLOW_HL  = [255, 255, 153] as [number, number, number];
      const BLUE_HL    = [153, 204, 255] as [number, number, number];
      const BLACK      = [0, 0, 0] as [number, number, number];
      const WHITE      = [255, 255, 255] as [number, number, number];

      // ─────────────────────────────────────────────
      // HEADER ROW (Red top bar)
      // ─────────────────────────────────────────────
      doc.setFillColor(...DARK_RED);
      doc.rect(0, 0, PW, 12, "F");

      // Lab name in header
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);
      doc.text((lab.name || "LABORATORIO").toUpperCase() + ".", 4, 8);

      // Subtitle in header
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      const subtitle =
        "SERVICIO DE MONITORIZACIÓN DE LA RADIACIÓN EXTERNA POR OSL.  " +
        "DOSIS EQUIVALENTE  PERSONAL  Hp (d) EN mSv  INFORME MENSUAL";
      doc.text(subtitle, PW / 2 - 10, 7.5, { align: "center" });

      // ─────────────────────────────────────────────
      // LOGO (left side under header)
      // ─────────────────────────────────────────────
      const logoToUse = lab.logo_url || "/physion-logo.png";
      const base64 = await loadImageAsBase64(logoToUse);
      if (base64) {
        try {
          doc.addImage(base64, "PNG", 2, 13, 30, 18);
        } catch (e) {
          console.error("Error adding image to PDF:", e);
        }
      }

      // "Nombre" / "Todas" selector mock (top right area)
      doc.setFontSize(7);
      doc.setTextColor(...BLACK);
      doc.setFont("helvetica", "normal");
      doc.text("Nombre", 38, 16);
      doc.text("Todas", 38, 21);
      // Month label
      doc.text("VER MES", 100, 16);
      doc.setFont("helvetica", "bold");
      doc.text(`${MONTH_NAMES_ES[month]} ${year}`, 100, 21);

      // ─────────────────────────────────────────────
      // THREE COLUMN LAYOUT
      // y start after header row
      // ─────────────────────────────────────────────
      const COL_START_Y = 33;
      const COL1_X = 2;   const COL1_W = 78;
      const COL2_X = 82;  const COL2_W = 108;
      const COL3_X = 192; const COL3_W = PW - 192 - 2;

      // ─────────────────────────────────────────────
      // COL 1: DATOS DEL CLIENTE
      // ─────────────────────────────────────────────
      // Title box
      doc.setFillColor(217, 217, 217);
      doc.rect(COL1_X, COL_START_Y, COL1_W, 7, "F");
      doc.setDrawColor(150, 150, 150);
      doc.rect(COL1_X, COL_START_Y, COL1_W, 7, "S");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BLACK);
      doc.text("DATOS DEL CLIENTE", COL1_X + COL1_W / 2, COL_START_Y + 4.5, { align: "center" });

      const drawField = (
        label: string,
        value: string,
        x: number,
        y: number,
        w: number
      ) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...MID_GRAY);
        doc.text(label + ":", x, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...BLACK);
        doc.setFontSize(7);
        const labelW = doc.getTextWidth(label + ": ") + 1;
        doc.text(value, x + labelW, y, { maxWidth: w - labelW - 1 });
      };

      let fy = COL_START_Y + 11;
      const FL = COL1_X + 1;
      const FS = 4.5;

      drawField("CÓDIGO", company.company_code || "N/A", FL, fy, COL1_W - 2);
      fy += FS;
      drawField("DOSIMETRÍA CORRESPONDIENTE AL MES", `${MONTH_NAMES_ES[month]} ${year}`, FL, fy, COL1_W - 2);
      fy += FS;
      drawField("RIF", company.tax_id || "N/A", FL, fy, COL1_W - 2);
      fy += FS;
      drawField("EMPRESA", company.name || "N/A", FL, fy, COL1_W - 2);
      fy += FS;
      drawField("DEPARTAMENTO", company.departamento || "N/A", FL, fy, COL1_W - 2);
      fy += FS;
      const fechaInicio = company.fecha_inicio_servicio
        ? new Date(company.fecha_inicio_servicio + "T00:00:00")
            .toLocaleDateString("es-VE", { day: "numeric", month: "numeric", year: "numeric" })
        : "N/A";
      drawField("FECHA DE INICIO DEL SERVICIO", fechaInicio, FL, fy, COL1_W - 2);
      fy += FS;
      drawField("TIPO DE RADIACIÓN", company.tipo_radiacion || "N/A", FL, fy, COL1_W - 2);
      fy += FS;
      drawField("UBICACIÓN DEL DOSÍMETRO", company.ubicacion_dosimetro || "N/A", FL, fy, COL1_W - 2);

      // Border around COL1 data section
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.3);
      doc.rect(COL1_X, COL_START_Y, COL1_W, fy - COL_START_Y + 4, "S");

      // ─────────────────────────────────────────────
      // COL 2: LEYENDA
      // ─────────────────────────────────────────────
      doc.setFillColor(217, 217, 217);
      doc.rect(COL2_X, COL_START_Y, COL2_W, 7, "F");
      doc.setDrawColor(150, 150, 150);
      doc.rect(COL2_X, COL_START_Y, COL2_W, 7, "S");
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BLACK);
      doc.text("LEYENDA", COL2_X + COL2_W / 2, COL_START_Y + 4.5, { align: "center" });

      const leyendaItems = [
        ["ND:", "NO DETECTABLE"],
        ["DD:", "DOSÍMETRO OSL DETERIORADO:"],
        ["DR:", "DOSÍMETRO OSL RETRASADO"],
        ["V:", "VACACIONES / AUSENTE"],
        ["DNU:", "DOSÍMETRO OSL NO UTILIZADO"],
        ["SLD:", "SUPERÓ LÍMITE DE DOSIS"],
        ["DE:", "DOSÍMETRO EXTRAVIADO"],
      ];

      const leyendaItems2 = [
        ["SRM:", "SUPERÓ NIVEL DE REFERENCIA MENSUAL"],
        ["SNI:", "SUPERÓ NIVEL DE INVESTIGACIÓN"],
        ["A:", "AMBIENTE H*10 MENSUAL"],
        ["Hp(10):", "DOSIS EQUIV. PERSON. A LA PROFUNDIDAD DE 10mm"],
        ["Hp(0.07):", "DOSIS EQUIV. PERSON. A LA PROFUNDIDAD DE 0.07mm"],
        ["Hp°(10):", "DOSIS EQUIV. AMBIENTAL"],
        ["DE:", "DOSÍMETRO EXTRAVIADO"],
        ["SS:", "SERVICIO SUSPENDIDO"],
      ];

      const LY_X1 = COL2_X + 1;
      const LY_X2 = COL2_X + 55;
      let ly = COL_START_Y + 11;
      const LY_S = 4.2;

      for (const [code, desc] of leyendaItems) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(...BLACK);
        doc.text(code, LY_X1, ly);
        doc.setFont("helvetica", "normal");
        doc.text(desc, LY_X1 + doc.getTextWidth(code) + 1, ly, { maxWidth: 50 });
        ly += LY_S;
      }

      ly = COL_START_Y + 11;
      for (const [code, desc] of leyendaItems2) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(...BLACK);
        doc.text(code, LY_X2, ly);
        doc.setFont("helvetica", "normal");
        doc.text(desc, LY_X2 + doc.getTextWidth(code) + 1, ly, { maxWidth: 50 });
        ly += LY_S;
      }

      doc.setDrawColor(150, 150, 150);
      doc.rect(COL2_X, COL_START_Y, COL2_W, ly - COL_START_Y + 1, "S");

      // ─────────────────────────────────────────────
      // COL 3: LIM. DOSIS NVC 2259 + LEYENDA SECUNDARIA
      // ─────────────────────────────────────────────
      doc.setFillColor(217, 217, 217);
      doc.rect(COL3_X, COL_START_Y, COL3_W, 7, "F");
      doc.setDrawColor(150, 150, 150);
      doc.rect(COL3_X, COL_START_Y, COL3_W, 7, "S");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BLACK);
      doc.text("LIM. DE DOSIS NVC 2259 VIGENTE", COL3_X + COL3_W / 2, COL_START_Y + 4.5, { align: "center" });

      // NVC table
      autoTable(doc, {
        startY: COL_START_Y + 7,
        margin: { left: COL3_X, right: 2 },
        tableWidth: COL3_W,
        head: [["", "TOE", "Pub."]],
        body: [
          ["DOSIS EFECTIVA mSv/a", "20", "1"],
          ["DOSIS EQUIVALENTE (mSv/a) para:", "", ""],
          ["CRISTALINO", "20", "15"],
          ["PIEL", "500", "50"],
        ],
        headStyles: {
          fillColor: [180, 0, 0],
          textColor: WHITE,
          fontSize: 6,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: { fontSize: 5.5, cellPadding: 1 },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 12, halign: "center", fontStyle: "bold" },
          2: { cellWidth: 12, halign: "center" },
        },
        theme: "grid",
      });

      const nvcEndY = (doc as any).lastAutoTable.finalY + 2;

      // LEYENDA SECUNDARIA
      doc.setFillColor(217, 217, 217);
      doc.rect(COL3_X, nvcEndY, COL3_W, 6, "F");
      doc.setDrawColor(150, 150, 150);
      doc.rect(COL3_X, nvcEndY, COL3_W, 6, "S");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BLACK);
      doc.text("LEYENDA", COL3_X + COL3_W / 2, nvcEndY + 4, { align: "center" });

      const secLeyendaItems = [
        ["INCERTIDUMBRE:", "±%"],
        ["VALOR DE REFERENCIA DOSIS\nMENSUAL, Hp(10):", "1.67 mSv"],
        ["VALOR DE REFERENCIA DOSIS\nMENSUAL, Hp(0.07):", "42 mSv"],
        ["NIVEL DE REGISTRO\nSUGERIDO:", "0.10 mSv"],
        ["LÍMITE DE DETECCIÓN DEL\nSISTEMA:", "0.10 mSv"],
      ];

      let sly = nvcEndY + 9;
      for (const [label, val] of secLeyendaItems) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.5);
        doc.setTextColor(...MID_GRAY);
        const lines = label.split("\n");
        lines.forEach((l, i) => doc.text(l, COL3_X + 1, sly + i * 3.5));
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BLACK);
        doc.text(val, COL3_X + COL3_W - 1, sly, { align: "right" });
        sly += lines.length * 3.5 + 1.5;
      }

      if (lab.mpps_auth) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.5);
        doc.setTextColor(...MID_GRAY);
        doc.text("AUTORIZACIÓN MPPS:", COL3_X + 1, sly);
        doc.setTextColor(...BLACK);
        doc.text(lab.mpps_auth, COL3_X + COL3_W - 1, sly, { align: "right" });
        sly += 4;
      }

      doc.setDrawColor(150, 150, 150);
      doc.rect(COL3_X, nvcEndY, COL3_W, sly - nvcEndY + 1, "S");

      // ─────────────────────────────────────────────
      // WORKERS TABLE
      // ─────────────────────────────────────────────
      const TABLE_START_Y = Math.max(fy + 6, ly + 3, sly + 4) + 2;

      const tableBody = workers.map((w: any) => [
        w.num,
        w.ci,
        `${w.last_name}, ${w.first_name}`,
        w.sex,
        w.birth_date,
        w.mes_hp007,
        w.mes_hp10,
        w.year_hp007,
        w.year_hp10,
        w.vida_hp007,
        w.vida_hp10,
        w.observacion,
      ]);

      const isND = (v: string) => v === "ND" || v === "N/D";

      autoTable(doc, {
        startY: TABLE_START_Y,
        margin: { left: 2, right: 2 },
        head: [
          [
            "#",
            "Cedula",
            "Nombre",
            "SEXO",
            "Fecha de\nnacimiento",
            "Mes Actual.\nHp(0.07)",
            "Mes Actual.\nHp(10)",
            "Total en el\naño (Hp 0.07)",
            "Total en el\naño (Hp 10)",
            "Dosis Vida\nHp(0.07)",
            "Dosis Vida\nHp(10)",
            "Observacion",
          ],
        ],
        body: tableBody,
        headStyles: {
          fillColor: [60, 60, 60],
          textColor: WHITE,
          fontSize: 5.5,
          halign: "center",
          fontStyle: "bold",
          cellPadding: 1.5,
        },
        bodyStyles: {
          fontSize: 6,
          cellPadding: 1.2,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 6 },
          1: { cellWidth: 18 },
          2: { cellWidth: 38, halign: "left" },
          3: { cellWidth: 9 },
          4: { cellWidth: 18 },
          5: { cellWidth: 16 },
          6: { cellWidth: 16 },
          7: { cellWidth: 17 },
          8: { cellWidth: 17 },
          9: { cellWidth: 17, fillColor: YELLOW_HL },
          10: { cellWidth: 17, fillColor: YELLOW_HL },
          11: { cellWidth: "auto" },
        },
        // Color coding: highlight values >= 0.1 in vida columns
        didParseCell: (hookData: any) => {
          const col = hookData.column.index;
          const val = String(hookData.cell.raw);
          // Vida Hp columns (9, 10)
          if (col === 9 || col === 10) {
            if (!isND(val) && val !== "" && parseFloat(val) > 0) {
              hookData.cell.styles.fillColor = BLUE_HL;
              hookData.cell.styles.fontStyle = "bold";
            } else {
              hookData.cell.styles.fillColor = YELLOW_HL;
            }
          }
          // Striped rows
          if (hookData.row.index % 2 === 1 && col < 9) {
            if (!hookData.cell.styles.fillColor || hookData.cell.styles.fillColor === WHITE) {
              hookData.cell.styles.fillColor = [245, 245, 245];
            }
          }
        },
        theme: "grid",
      });

      // ─────────────────────────────────────────────
      // SIGNATURE SECTION
      // ─────────────────────────────────────────────
      const sigY = PH - 22;
      const sigX = PW - 75;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(sigX, sigY + 10, sigX + 55, sigY + 10);

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BLACK);
      const repName = `${lab.rep_title || ""} ${lab.rep_first_name || ""} ${lab.rep_last_name || ""}`.trim();
      doc.text(repName, sigX + 27.5, sigY + 13.5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text("Firma", sigX + 10, sigY + 17);
      doc.text(lab.rep_cargo || "Director", sigX + 27.5, sigY + 17, { align: "center" });

      // ─────────────────────────────────────────────
      // SAVE
      // ─────────────────────────────────────────────
      const safeName = company.name.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
      doc.save(`Informe_Mensual_${safeName}_${MONTH_NAMES_ES[month]}_${year}.pdf`);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al generar el informe");
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="glass-panel" style={{ padding: "1.25rem", border: "1px solid var(--primary-teal)", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Loader2 size={20} className="animate-spin" color="var(--primary-teal)" />
        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Generando Informe Mensual PDF...</span>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="glass-panel" style={{ padding: "1.25rem", border: "1px solid #22c55e", display: "flex", alignItems: "center", gap: "1rem" }}>
        <CheckCircle size={20} color="#22c55e" />
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#22c55e" }}>¡Informe generado! Descargando...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="glass-panel" style={{ padding: "1.25rem", border: "1px solid #ef4444" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <AlertCircle size={20} color="#ef4444" />
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ef4444" }}>Error: {errorMsg}</span>
        </div>
        <button onClick={() => setStatus("idle")} style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--primary-teal)", border: "none", background: "none", cursor: "pointer" }}>
          REINTENTAR
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={generatePDF}
      className="btn btn-primary"
      style={{ gap: "0.75rem", width: "100%", justifyContent: "center", padding: "0.875rem" }}
    >
      <FileText size={18} />
      Generar Informe Mensual PDF
    </button>
  );
}
