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

      // ─────────────────────────────────────────────
      // 1. TOP HEADER (Blue)
      // ─────────────────────────────────────────────
      doc.setFillColor(...DARK_BLUE);
      doc.rect(0, 0, PW, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...WHITE);
      doc.text("PHYSION TECNOLOGÍA NUCLEAR.", 4, 7);
      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(8);
      doc.text("SERVICIO DE MONITORIZACIÓN DE LA RADIACIÓN EXTERNA POR OSL. DOSIS EQUIVALENTE PERSONAL Hp (d) EN mSv INFORME MENSUAL", PW - 4, 6.5, { align: "right" });

      // ─────────────────────────────────────────────
      // 2. LOGO ONLY (Moved up)
      // ─────────────────────────────────────────────
      const logoToUse = lab.logo_url || "/physion-logo.png";
      const base64 = await loadImageAsBase64(logoToUse);
      if (base64) {
        try { doc.addImage(base64, "PNG", 4, 11, 28, 18); } catch (e) { console.error(e); }
      }

      // ─────────────────────────────────────────────
      // 3. MAIN CONTENT BOXES (Y adjusted)
      // ─────────────────────────────────────────────
      const BOX_Y = 32;
      const BOX_H = 48;
      const C1_W = 90;
      const C2_W = 120;
      const C3_W = PW - C1_W - C2_W - 12;

      // BOX 1: CLIENTE
      doc.setDrawColor(...BLACK); doc.setLineWidth(0.3);
      doc.roundedRect(4, BOX_Y, C1_W, BOX_H, 3, 3, "S");
      doc.setFillColor(...PINK_RED); doc.rect(4.3, BOX_Y + 6, C1_W - 0.6, 2.5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
      doc.text("DATOS DEL CLIENTE", 4 + C1_W / 2, BOX_Y + 4.5, { align: "center" });

      const drawF = (l: string, v: string, x: number, y: number) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.text(l + ":", x, y);
        doc.setFont("helvetica", "normal"); doc.setFontSize(7);
        const offset = l.length > 30 ? 55 : 45;
        doc.text(v, x + offset, y);
      };
      let fy = BOX_Y + 13;
      drawF("CÓDIGO", company.company_code || "0153", 8, fy); fy += 4.5;
      drawF("DOSIMETRÍA CORRESPONDIENTE AL MES", `${MONTH_NAMES_ES[month]} ${year}`, 8, fy); fy += 4.5;
      drawF("RIF", company.tax_id || "J-00294315-7", 8, fy); fy += 4.5;
      drawF("EMPRESA", (company.name || "EMPRESA").toUpperCase(), 8, fy); fy += 4.5;
      drawF("DEPARTAMENTO", (company.departamento || "RADIOLOGIA").toUpperCase(), 8, fy); fy += 4.5;
      const fIn = company.fecha_inicio_servicio ? new Date(company.fecha_inicio_servicio + "T00:00:00").toLocaleDateString("es-VE") : "N/A";
      drawF("FECHA DE INICIO DEL SERVICIO", fIn, 8, fy); fy += 4.5;
      drawF("TIPO DE RADIACIÓN", (company.tipo_radiacion || "PENETRANTE Y NO PENETRANTE").toUpperCase(), 8, fy); fy += 4.5;
      drawF("UBICACIÓN DEL DOSIMETRO", (company.ubicacion_dosimetro || "TORAX").toUpperCase(), 8, fy);

      // BOX 2: LEYENDA OSL
      const C2_X = 4 + C1_W + 2;
      doc.roundedRect(C2_X, BOX_Y, C2_W, BOX_H, 3, 3, "S");
      doc.setFillColor(...DARK_RED); doc.rect(C2_X + 0.3, BOX_Y + 6, C2_W - 0.6, 2.5, "F");
      doc.setFont("helvetica", "bold"); doc.text("LEYENDA", C2_X + C2_W / 2, BOX_Y + 4.5, { align: "center" });

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
      let ly = BOX_Y + 13;
      L1.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.text(k, C2_X + 4, ly);
        doc.setFont("helvetica", "normal"); doc.text(v, C2_X + 16, ly); ly += 4.8;
      });
      ly = BOX_Y + 13;
      L2.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.text(k, C2_X + 64, ly);
        doc.setFont("helvetica", "normal"); doc.text(v, C2_X + 78, ly, { maxWidth: 38 }); ly += 4.8;
      });

      // BOX 3: NVC
      const C3_X = C2_X + C2_W + 2;
      doc.roundedRect(C3_X, BOX_Y, C3_W, 28, 3, 3, "S");
      doc.setFillColor(...PINK_RED); doc.rect(C3_X + 0.3, BOX_Y + 6, C3_W - 0.6, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      doc.text("LIM. DE DOSIS NVC 2259 VIGENTE", C3_X + C3_W / 2, BOX_Y + 4.5, { align: "center" });

      autoTable(doc, {
        startY: BOX_Y + 10, margin: { left: C3_X + 2 }, tableWidth: C3_W - 4,
        head: [["", "TOE", "Pub."]],
        body: [["DOSIS EFECTIVA mSv/a", "20", "1"], ["DOSIS EQUIVALENTE (mSv/a) para:", "", ""], ["CRISTALINO", "20", "15"], ["PIEL", "500", "50"]],
        theme: "grid", styles: { fontSize: 6, fontStyle: "bold", textColor: [0, 0, 0], cellPadding: 0.5 },
        headStyles: { fillColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, halign: "center" },
        columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 8, halign: "center" }, 2: { cellWidth: 8, halign: "center" } }
      });

      // ─────────────────────────────────────────────
      // 4. MAIN TABLE (75% Width)
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

      const TABLE_W = 220; 
      autoTable(doc, {
        startY: BOX_Y + BOX_H + 5, margin: { left: 4 }, tableWidth: TABLE_W,
        head: [["#", "Cedula", "Nombre", "SEXO", "Fecha de\nnacimiento", "Mes Actual.\nHp(0,07)", "Mes Actual.\nHp(10)", "Total en el\naño (Hp 0,07)", "Total en el\naño (Hp 10)", "Dosis Vida\nHp(0,07)", "Dosis Vida\nHp(10)", "Observacion"]],
        body: tableBody,
        theme: "grid", styles: { fontSize: 6.5, textColor: [0, 0, 0], halign: "center", cellPadding: 1 },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [200, 200, 200], fontSize: 6 },
        columnStyles: {
          2: { halign: "left", cellWidth: 42 },
          9: { fillColor: [153, 204, 255], fontStyle: "bold" },
          10: { fillColor: [153, 204, 255], fontStyle: "bold" },
        },
        didParseCell: (h) => {
          const isAmb = String(h.row.cells[2].raw).toUpperCase().includes("AMBIENTE");
          if (isAmb && (h.column.index === 9 || h.column.index === 10)) {
            h.cell.styles.fillColor = [255, 255, 255];
          }
        }
      });

      // ─────────────────────────────────────────────
      // 5. RIGHT SIDE BOXES (Moved up)
      // ─────────────────────────────────────────────
      const RX = 226;
      const RW = PW - RX - 4;
      const RY_S = BOX_Y + BOX_H + 5;

      doc.roundedRect(RX, RY_S, RW, 52, 3, 3, "S");
      doc.setFillColor(...PINK_RED); doc.rect(RX + 0.3, RY_S + 6, RW - 0.6, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("LEYENDA", RX + RW / 2, RY_S + 4.5, { align: "center" });

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
      let ry = RY_S + 11;
      SL.forEach(([k, v]) => {
        doc.setFontSize(6); doc.text(k, RX + 2, ry); doc.text(v, RX + 32, ry);
        ry += k.includes("\n") ? 7.5 : 4.5;
      });
      ry = RY_S + 11;
      SR.forEach(([k, v]) => {
        doc.setFontSize(6); doc.text(k, RX + 44, ry); doc.text(v, RX + 44, ry + 6.5);
        ry += 11;
      });

      const SIG_Y = RY_S + 55;
      doc.roundedRect(RX, SIG_Y, RW, 30, 3, 3, "S");
      doc.line(RX + 5, SIG_Y + 18, RX + RW - 25, SIG_Y + 18);
      doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
      const rep = `${lab.rep_title || "Ing."} ${lab.rep_first_name || ""} ${lab.rep_last_name || ""}`;
      doc.text(rep, RX + RW - 10, SIG_Y + 22, { align: "right" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.text("Firma", RX + 7, SIG_Y + 26);
      doc.text(lab.rep_cargo || "Presidente", RX + RW - 10, SIG_Y + 26, { align: "right" });

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
