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
      const DARK_RED = [180, 0, 0] as [number, number, number];
      const PINK_RED = [235, 137, 145] as [number, number, number];

      // 1. HEADER
      doc.setFillColor(...DARK_BLUE);
      doc.rect(0, 0, PW, 9, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...WHITE);
      doc.text("PHYSION TECNOLOGÍA NUCLEAR.", 4, 6.5);
      doc.setFont("helvetica", "bolditalic"); doc.setFontSize(7.5);
      doc.text("SERVICIO DE MONITORIZACIÓN DE LA RADIACIÓN EXTERNA POR OSL. DOSIS EQUIVALENTE PERSONAL Hp (d) EN mSv INFORME MENSUAL", PW - 4, 6, { align: "right" });

      const logoToUse = lab.logo_url || "/physion-logo.png";
      const base64 = await loadImageAsBase64(logoToUse);
      if (base64) {
        try { doc.addImage(base64, "PNG", 4, 10, 24, 15); } catch (e) { console.error(e); }
      }

      // 2. TOP BOXES
      const BOX_Y = 27;
      const BOX_H = 40;
      const C1_W = 98;
      const C2_W = 138;
      const C3_W = PW - C1_W - C2_W - 12;

      doc.setDrawColor(...BLACK); doc.setLineWidth(0.2);
      doc.roundedRect(4, BOX_Y, C1_W, BOX_H, 2.5, 2.5, "S");
      doc.setFillColor(...PINK_RED); doc.rect(4.1, BOX_Y + 5, C1_W - 0.2, 1.8, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
      doc.text("DATOS DEL CLIENTE", 4 + C1_W / 2, BOX_Y + 4, { align: "center" });

      const drawF = (l: string, v: string, x: number, y: number) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(6.2); doc.text(l + ":", x, y);
        doc.setFont("helvetica", "normal"); doc.text(String(v), x + (l.length > 30 ? 50 : 40), y);
      };
      let fy = BOX_Y + 10;
      drawF("CÓDIGO", company.company_code || "0153", 7, fy); fy += 4;
      drawF("DOSIMETRÍA CORRESPONDIENTE AL MES", `${MONTH_NAMES_ES[month]} ${year}`, 7, fy); fy += 4;
      drawF("RIF", company.tax_id || "J-00294315-7", 7, fy); fy += 4;
      drawF("EMPRESA", (company.name || "EMPRESA").toUpperCase(), 7, fy); fy += 4;
      drawF("DEPARTAMENTO", (company.departamento || "RADIOLOGIA").toUpperCase(), 7, fy); fy += 4;
      const fIn = company.fecha_inicio_servicio ? new Date(company.fecha_inicio_servicio + "T00:00:00").toLocaleDateString("es-VE") : "N/A";
      drawF("FECHA DE INICIO DEL SERVICIO", fIn, 7, fy); fy += 4;
      drawF("TIPO DE RADIACIÓN", (company.tipo_radiacion || "PENETRANTE Y NO PENETRANTE").toUpperCase(), 7, fy); fy += 4;
      drawF("UBICACIÓN DEL DOSIMETRO", (company.ubicacion_dosimetro || "TORAX").toUpperCase(), 7, fy);

      const C2_X = 4 + C1_W + 2;
      doc.roundedRect(C2_X, BOX_Y, C2_W, BOX_H, 2.5, 2.5, "S");
      doc.setFillColor(...DARK_RED); doc.rect(C2_X + 0.1, BOX_Y + 5, C2_W - 0.2, 1.8, "F");
      doc.setFont("helvetica", "bold"); doc.text("LEYENDA", C2_X + C2_W / 2, BOX_Y + 4, { align: "center" });

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
      let ly = BOX_Y + 10;
      L1.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.text(k, C2_X + 3, ly);
        doc.setFont("helvetica", "normal"); doc.text(v, C2_X + 13, ly); ly += 4;
      });
      ly = BOX_Y + 10;
      L2.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.text(k, C2_X + 55, ly);
        doc.setFont("helvetica", "normal"); 
        const offset = k.length > 8 ? 20 : 15;
        doc.text(v, C2_X + 55 + offset, ly, { maxWidth: 65 }); ly += 4;
      });

      const C3_X = C2_X + C2_W + 2;
      doc.roundedRect(C3_X, BOX_Y, C3_W, BOX_H, 2.5, 2.5, "S");
      doc.setFillColor(...PINK_RED); doc.rect(C3_X + 0.1, BOX_Y + 5, C3_W - 0.2, 1.8, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text("LIM. DE DOSIS NVC 2259 VIGENTE", C3_X + C3_W / 2, BOX_Y + 4, { align: "center" });

      autoTable(doc, {
        startY: BOX_Y + 7.5, margin: { left: C3_X + 1.5 }, tableWidth: C3_W - 3,
        head: [["", "TOE", "Pub."]],
        body: [["DOSIS EFECTIVA mSv/a", "20", "1"], ["DOSIS EQUIVALENTE (mSv/a) para:", "", ""], ["CRISTALINO", "20", "15"], ["PIEL", "500", "50"]],
        theme: "grid", styles: { fontSize: 5.2, fontStyle: "bold", textColor: [0, 0, 0], cellPadding: 0.35 },
        headStyles: { fillColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, halign: "center" },
        columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 7, halign: "center" }, 2: { cellWidth: 7, halign: "center" } }
      });

      // 3. MAIN TABLE
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
        startY: BOX_Y + BOX_H + 3, 
        margin: { left: 4, right: 4, bottom: 42 }, // PREVENT OVERLAP WITH FOOTER
        head: [["#", "Cedula", "Nombre", "SEXO", "Fecha de\nnacimiento", "Mes Actual.\nHp(0,07)", "Mes Actual.\nHp(10)", "Total en el\naño (Hp 0,07)", "Total en el\naño (Hp 10)", "Dosis Vida\nHp(0,07)", "Dosis Vida\nHp(10)", "Observacion"]],
        body: tableBody,
        theme: "grid", styles: { fontSize: 6.5, textColor: [0, 0, 0], halign: "center", cellPadding: 0.8 },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [200, 200, 200], fontSize: 6 },
        columnStyles: {
          2: { halign: "left", cellWidth: 45 },
          9: { fillColor: [153, 204, 255], fontStyle: "bold" },
          10: { fillColor: [153, 204, 255], fontStyle: "bold" },
        },
        didParseCell: (h) => {
          const isAmb = String(h.row.cells[2].raw).toUpperCase().includes("AMBIENTE");
          if (isAmb && (h.column.index === 9 || h.column.index === 10)) {
            h.cell.styles.fillColor = [255, 255, 255];
          }
        },
        didDrawPage: (data) => {
          // RENDER FOOTER ON EACH PAGE OR LAST PAGE? 
          // Usually just the page where the table ends or all pages if it's a template.
          // The user wants it at the footer. Let's render it on every page to be safe or only the last.
          // Actually, let's render it at the bottom of the current page.
          
          const footerY = PH - 38;
          const footerH = 34;
          const legendW = 205;
          const sigW = PW - legendW - 12;

          // BOX: LEYENDA TECNICA
          doc.setDrawColor(...BLACK); doc.setLineWidth(0.2);
          doc.roundedRect(4, footerY, legendW, footerH, 2, 2, "S");
          doc.setFillColor(...PINK_RED); doc.rect(4.1, footerY + 5, legendW - 0.2, 1.8, "F");
          doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...BLACK);
          doc.text("LEYENDA", 4 + legendW / 2, footerY + 4, { align: "center" });

          const techItems = [
            ["INCERTIDUMBRE:", "4%"],
            ["VALOR DE REFERENCIA DOSIS MENSUAL Hp (10):", "1.67 mSv"],
            ["VALOR DE REFERENCIA DOSIS MENSUAL Hp (0.07):", "42 mSv"],
            ["NIVEL DE REGISTRO SUGERIDO:", "0.10 mSv"],
            ["LIMITE DE DETECCIÓN DEL SISTEMA:", "0.10 mSv"],
            ["AUTORIZACIÓN DGEA:", "PIDS-DOS-COS-0001"],
            ["NIVEL DE INVESTIGACIÓN SUGERIDO (NI) PARA Hp(10):", "0.50 mSv"],
            ["NIVEL DE INVESTIGACIÓN SUGERIDO (NI) PARA Hp(0,07):", "12 mSv"],
            ["AUTORIZACIÓN MPPS:", lab.mpps_auth || "0012-2022"]
          ];

          doc.setFontSize(5.2);
          let ty = footerY + 9.5;
          techItems.forEach((item, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const curX = 6 + col * 68;
            const curY = ty + row * 6;
            doc.setFont("helvetica", "bold");
            doc.text(item[0], curX, curY, { maxWidth: 48 });
            doc.setFont("helvetica", "normal");
            const labelW = doc.getTextWidth(item[0]);
            const offset = item[0].length > 35 ? 50 : 42;
            doc.text(String(item[1]), curX + offset, curY);
          });

          // BOX: SIGNATURE
          const sx = 4 + legendW + 4;
          doc.roundedRect(sx, footerY, sigW, footerH, 2, 2, "S");
          doc.line(sx + 5, footerY + 20, sx + sigW - 5, footerY + 20);
          doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
          const rep = `${lab.rep_title || "Ing."} ${lab.rep_first_name || ""} ${lab.rep_last_name || ""}`;
          doc.text(rep, sx + sigW / 2, footerY + 24, { align: "center" });
          doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
          doc.text("Firma", sx + 8, footerY + 28);
          doc.text(lab.rep_cargo || "Presidente", sx + sigW / 2 + 5, footerY + 28, { align: "center" });
        }
      });

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
