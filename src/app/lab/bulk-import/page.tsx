"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { bulkImportAction } from "./actions";
import ImportTypeSelector from "@/components/lab/bulk-import/ImportTypeSelector";
import TemplatesDownload from "@/components/lab/bulk-import/TemplatesDownload";
import LogicExplanation from "@/components/lab/bulk-import/LogicExplanation";
import FileUploader from "@/components/lab/bulk-import/FileUploader";
import DataPreview from "@/components/lab/bulk-import/DataPreview";
import ImportResults from "@/components/lab/bulk-import/ImportResults";

type ImportType = "companies" | "workers" | "doses" | null;

export default function BulkImportPage() {
  const [importType, setImportType] = useState<ImportType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: any[]; mapping?: any[] } | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const arrayBuffer = evt.target?.result as ArrayBuffer;
      const isCSV = file.name.toLowerCase().endsWith(".csv");
      let data: any[];

      if (isCSV) {
        const bytes = new Uint8Array(arrayBuffer.slice(0, 3));
        const hasUtf8Bom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
        const encoding = hasUtf8Bom ? "utf-8" : "utf-8";
        const text = new TextDecoder(encoding).decode(arrayBuffer);
        const wb = XLSX.read(text, { type: "string" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        data = XLSX.utils.sheet_to_json(ws);
      } else {
        const wb = XLSX.read(arrayBuffer, { type: "array", codepage: 65001 });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        data = XLSX.utils.sheet_to_json(ws);
      }

      setRawData(data);
      setPreview(data.slice(0, 5));
    };
    reader.readAsArrayBuffer(file);
  };

  const processImport = async () => {
    if (rawData.length === 0) return;
    setLoading(true);
    setProgress(0);
    setResults(null);

    const CHUNK_SIZE = 500;
    let totalSuccess = 0;
    const allErrors: any[] = [];
    const allMappings: any[] = [];

    try {
      if (!importType) return;

      for (let i = 0; i < rawData.length; i += CHUNK_SIZE) {
        const chunk = rawData.slice(i, i + CHUNK_SIZE);
        const res = await bulkImportAction(importType, chunk);
        
        totalSuccess += res.success;
        allErrors.push(...res.errors);
        if (res.mapping) allMappings.push(...res.mapping);

        const currentProgress = Math.min(Math.round(((i + CHUNK_SIZE) / rawData.length) * 100), 100);
        setProgress(currentProgress);

        if (i + CHUNK_SIZE < rawData.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setResults({ success: totalSuccess, errors: allErrors, mapping: allMappings });
    } catch (err: any) {
      alert(`Error durante la importación: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getMissingColumns = () => {
    if (!importType || preview.length === 0) return [];
    const headers = Object.keys(preview[0]).map((h) => h.toLowerCase());
    const required: Record<string, string[]> = {
      companies: ["rif", "entidad", "dirección", "osr nom", "osr ci", "osr email"],
      workers: ["ci", "nombre", "apellido", "rif"],
      doses: ["ci", "rif", "mes", "año"],
    };

    const checkCol = (headers: string[], req: string) => {
      if (req === "rif") {
        return headers.some(h => h.includes("rif") || h.includes("codigo") || h.includes("id"));
      }
      return headers.some((h) => h.includes(req));
    };

    return required[importType as string].filter(
      (req) => !checkCol(headers, req)
    );
  };

  const missingCols = getMissingColumns();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
          Importación Masiva
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Automatice la carga de datos mediante archivos Excel o CSV con trazabilidad garantizada.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2.5rem" }}>
        {/* LEFT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <ImportTypeSelector importType={importType} setImportType={setImportType} />
          <TemplatesDownload />
          <LogicExplanation />
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <FileUploader file={file} handleFileUpload={handleFileUpload} />
          
          <DataPreview 
            preview={preview}
            importType={importType}
            missingCols={missingCols}
            loading={loading}
            progress={progress}
            rawDataLength={rawData.length}
            processImport={processImport}
          />

          <ImportResults results={results} />
        </div>
      </div>

      <style jsx>{`
        :global(.animate-spin) {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
