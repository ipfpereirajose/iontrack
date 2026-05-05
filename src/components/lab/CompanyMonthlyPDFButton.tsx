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

      const BLACK = [0, 0, 0] as [number, number, number];
      const WHITE = [255, 255, 255] as [number, number, number];
      const DARK_BLUE = [0, 68, 124] as [number, number, number];
      const BORDER_GRAY = [180, 180, 180] as [number, number, number];

      // ─────────────────────────────────────────────
      // 1. TOP BLUE BAR (Header)
      // ─────────────────────────────────────────────
      doc.setFillColor(...DARK_BLUE);
      doc.rect(0, 0, PW, 10, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...WHITE);
      doc.text("PHYSION TECNOLOGÍA NUCLEAR.", 4, 7);

      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(8);
      const sub = "SERVICIO DE MONITORIZACIÓN DE LA RADIACIÓN EXTERNA POR OSL. DOSIS EQUIVALENTE PERSONAL Hp (d) EN mSv INFORME MENSUAL";
      doc.text(sub, PW - 5, 6.5, { align: "right" });

      // ─────────────────────────────────────────────
      // 2. LOGO & DASHBOARD MOCK AREA
      // ─────────────────────────────────────────────
      const logoToUse = lab.logo_url || "/physion-logo.png";
      const base64 = await loadImageAsBase64(logoToUse);
      if (base64) {
        try {
          doc.addImage(base64, "PNG", 4, 11, 28, 18);
        } catch (e) { console.error(e); }
      }

      // Selectors Mocks
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...BLACK);
      doc.text("Nombre", 35, 15);
      doc.text("VER MES", 100, 15);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.setDrawColor(...BORDER_GRAY);
      doc.roundedRect(35, 17, 60, 6, 1, 1, "S");
      doc.text("Todas", 37, 21);
      
      doc.roundedRect(100, 17, 60, 6, 1, 1, "S");
      doc.text(`${MONTH_NAMES_ES[month]} ${year}`, 102, 21);

      // Buttons Mocks
      doc.roundedRect(PW - 55, 14, 25, 10, 2, 2, "S");
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text("REGRESAR", PW - 40, 20.5, { align: "center" });
      
      doc.roundedRect(PW - 28, 14, 25, 10, 2, 2, "S");
      doc.text("IMPRIMIR", PW - 13, 20.5, { align: "center" });

      // ─────────────────────────────────────────────
      // 3. MAIN CONTENT BOXES
      // ─────────────────────────────────────────────
      const COL_START_Y = 32;
      const COL_H = 55;
      const COL1_W = 90;
      const COL2_W = 120;
      const COL3_W = PW - COL1_W - COL2_W - 12;

      // BOX 1: DATOS DEL CLIENTE
      doc.setDrawColor(...BLACK);
      doc.setLineWidth(0.3);
      doc.roundedRect(4, COL_START_Y, COL1_W, COL_H, 3, 3, "S");
      doc.setFillColor(235, 137, 145); // Pinkish red bar
      doc.rect(4.3, COL_START_Y + 6, COL1_W - 0.6, 2.5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...BLACK);
      doc.text("DATOS DEL CLIENTE", 4 + COL1_W / 2, COL_START_Y + 4.5, { align: "center" });

      const drawField = (label: string, value: string, x: number, y: number) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.text(label + ":", x, y);
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.text(value, x + 42, y);
      };

      let fy = COL_START_Y + 13;
      drawField("CÓDIGO", company.company_code || "0153", 8, fy); fy += 5;
      drawField("DOSIMETRÍA CORRESPONDIENTE AL MES", `${MONTH_NAMES_ES[month]} ${year}`, 8, fy); fy += 5;
      drawField("RIF", company.tax_id || "J-00294315-7", 8, fy); fy += 5;
      drawField("EMPRESA", (company.name || "CENTRO MEDICO PASO REAL, S.A.").toUpperCase(), 8, fy); fy += 5;
      drawField("DEPARTAMENTO", (company.departamento || "RADIOLOGIA").toUpperCase(), 8, fy); fy += 5;
      const fIn = company.fecha_inicio_servicio ? new Date(company.fecha_inicio_servicio + "T00:00:00").toLocaleDateString("es-VE") : "9/1/2023";
      drawField("FECHA DE INICIO DEL SERVICIO", fIn, 8, fy); fy += 5;
      drawField("TIPO DE RADIACIÓN", (company.tipo_radiacion || "PENETRANTE Y NO PENETRANTE").toUpperCase(), 8, fy); fy += 5;
      drawField("UBICACIÓN DEL DOSIMETRO", (company.ubicacion_dosimetro || "TORAX").toUpperCase(), 8, fy);

      // BOX 2: LEYENDA
      const C2X = 4 + COL1_W + 2;
      doc.roundedRect(C2X, COL_START_Y, COL2_W, COL_H, 3, 3, "S");
      doc.setFillColor(180, 0, 0); // Solid red bar
      doc.rect(C2X + 0.3, COL_START_Y + 6, COL2_W - 0.6, 2.5, "F");
      doc.setFont("helvetica", "bold"); doc.text("LEYENDA", C2X + COL2_W / 2, COL_START_Y + 4.5, { align: "center" });

      const L1 = [
        ["ND:", "NO DETECTABLE"], ["DD:", "DOSIMETRO OSL DETERIORADO:"], ["DR:", "DOSIMETRO OSL RETRASADO"],
        ["V:", "VACACIONES / AUSENTE"], ["DNU:", "DOSIMETRO OSL NO UTILIZADO"], ["SLD:", "SUPERÓ LÍMITE DE DOSIS"],
        ["DE:", "DOSÍMETRO EXTRAVIADO"]
      ];
      const L2 = [
        ["SRM:", "SUPERÓ NIVEL DE REFERENCIA MENSUAL"], ["SNI:", "SUPERÓ NIVEL DE INVESTIGACIÓN"], ["A:", "AMBIENTE H*10 MENSUAL"],
        ["Hp(10):", "DOSIS EQUIV. PERSON. A LA PROFUNDIDAD DE 10mm"], ["Hp(0,07):", "DOSIS EQUIV. PERSON. A LA PROFUNDIDAD DE 0,07mm"],
        ["Hp*(10):", "DOSIS EQUIV. AMBIENTAL"], ["DE:", "DOSÍMETRO EXTRAVIADO"], ["SS:", "SERVICIO SUSPENDIDO"]
      ];

      let ly = COL_START_Y + 14;
      L1.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.text(k, C2X + 4, ly);
        doc.setFont("helvetica", "normal"); doc.text(v, C2X + 14, ly); ly += 5.2;
      });
      ly = COL_START_Y + 14;
      L2.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.text(k, C2X + 64, ly);
        doc.setFont("helvetica", "normal"); doc.text(v, C2X + 78, ly, { maxWidth: 40 }); ly += 5.2;
      });

      // BOX 3: NVC & SECONDARY LEYENDA
      const C3X = C2X + COL2_W + 2;
      doc.roundedRect(C3X, COL_START_Y, COL3_W, 30, 3, 3, "S");
      doc.setFillColor(235, 137, 145);
      doc.rect(C3X + 0.3, COL_START_Y + 6, COL3_W - 0.6, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      doc.text("LIM. DE DOSIS NVC 2259 VIGENTE", C3X + COL3_W / 2, COL_START_Y + 4.5, { align: "center" });

      autoTable(doc, {
        startY: COL_START_Y + 9, margin: { left: C3X + 2 }, tableWidth: COL3_W - 4,
        head: [["", "TOE", "Pub."]],
        body: [["DOSIS EFECTIVA mSv/a", "20", "1"], ["DOSIS EQUIVALENTE (mSv/a) para:", "", ""], ["CRISTALINO", "20", "15"], ["PIEL", "500", "50"]],
        theme: "grid", styles: { fontSize: 6.5, fontStyle: "bold", textColor: [0, 0, 0], cellPadding: 0.5 },
        headStyles: { fillColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, halign: "center" },
        columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 8, halign: "center" }, 2: { cellWidth: 8, halign: "center" } }
      });

      const n2y = COL_START_Y + 32;
      doc.roundedRect(C3X, n2y, COL3_W, 55, 3, 3, "S");
      doc.setFillColor(235, 137, 145);
      doc.rect(C3X + 0.3, n2y + 6, COL3_W - 0.6, 2, "F");
      doc.text("LEYENDA", C3X + COL3_W / 2, n2y + 4.5, { align: "center" });

      const SL = [
        ["INCERTIDUMBRE:", "4%"], ["VALOR DE REFERENCIA DOSIS\nMENSUAL Hp (10):", "1.67 mSv"],
        ["VALOR DE REFERENCIA DOSIS\nMENSUAL Hp (0.07):", "42 mSv"], ["NIVEL DE REGISTRO\nSUGERIDO:", "0.10 mSv"],
        ["LIMITE DE DETECCIÓN DEL\nSISTEMA:", "0.10 mSv"], ["AUTORIZACIÓN DGEA:", "PIDS-DOS-COS-0001"]
      ];
      const SR = [
        ["NIVEL DE INVESTIGACIÓN\nSUGERIDO (NI) PARA\nHp(10):", "0.50 mSv"],
        ["NIVEL DE INVESTIGACIÓN\nSUGERIDO (NI) PARA\nHp(0.07):", "12 mSv"],
        ["AUTORIZACIÓN MPPS:", lab.mpps_auth || "0012-2022"]
      ];

      let sy = n2y + 11;
      SL.forEach(([k, v]) => {
        doc.setFontSize(6); doc.text(k, C3X + 2, sy); doc.text(v, C3X + 33, sy);
        sy += k.includes("\n") ? 7.5 : 4.5;
      });
      sy = n2y + 11;
      SR.forEach(([k, v]) => {
        doc.setFontSize(6); doc.text(k, C3X + 44, sy); doc.text(v, C3X + 44, sy + 6.5);
        sy += 11;
      });

      // ─────────────────────────────────────────────
      // 4. WORKERS TABLE
      // ─────────────────────────────────────────────
      const tableBody = workers.map((w: any) => {
        const isAmb = w.first_name.toUpperCase().startsWith("AMBIENTE");
        return [
          w.num, isAmb ? "" : w.ci, `${w.last_name} ${w.first_name}`.trim(),
          isAmb ? "" : w.sex, isAmb ? "" : w.birth_date,
          w.mes_hp007, w.mes_hp10, isAmb ? "" : "N/D", isAmb ? "" : "N/D",
          isAmb ? "" : w.vida_hp007, isAmb ? "" : w.vida_hp10, w.observacion
        ];
      });

      autoTable(doc, {
        startY: 92, margin: { left: 4, right: 4 },
        head: [["#", "Cedula", "Nombre", "SEXO", "Fecha de\nnacimiento", "Mes Actual.\nHp(0,07)", "Mes Actual.\nHp(10)", "Total en el\naño (Hp 0,07)", "Total en el\naño (Hp 10)", "Dosis Vida\nHp(0,07)", "Dosis Vida\nHp(10)", "Observacion"]],
        body: tableBody,
        theme: "grid", styles: { fontSize: 6.5, textColor: [0, 0, 0], halign: "center", cellPadding: 0.8 },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [200, 200, 200], fontSize: 6 },
        columnStyles: {
          2: { halign: "left", cellWidth: 42 },
          9: { fillColor: [153, 204, 255], fontStyle: "bold" },
          10: { fillColor: [153, 204, 255], fontStyle: "bold" },
        },
        didParseCell: (data) => {
          const isAmb = String(data.row.cells[2].raw).toUpperCase().includes("AMBIENTE");
          if (isAmb && (data.column.index === 9 || data.column.index === 10)) {
            data.cell.styles.fillColor = [255, 255, 255];
          }
        }
      });

      // ─────────────────────────────────────────────
      // 5. SIGNATURE
      // ─────────────────────────────────────────────
      const sigY = PH - 25;
      doc.line(PW - 65, sigY, PW - 15, sigY);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      const rep = `${lab.rep_title || "Ing."} ${lab.rep_first_name || ""} ${lab.rep_last_name || ""}`;
      doc.text(rep, PW - 40, sigY + 5, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.text("Firma", PW - 55, sigY + 9);
      doc.text(lab.rep_cargo || "Presidente", PW - 40, sigY + 9, { align: "center" });

      doc.save(`Informe_Mensual_${company.name}_${MONTH_NAMES_ES[month]}_${year}.pdf`);
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
