'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Database, ArrowRight, Loader2, Fingerprint, Shield, Users, ClipboardList } from 'lucide-react';
import * as XLSX from 'xlsx';
import { bulkImportAction } from './actions';
import RegulatoryReportButton from '@/components/lab/RegulatoryReportButton';

type ImportType = 'companies' | 'workers' | 'doses';

export default function BulkImportPage() {
  const [importType, setImportType] = useState<ImportType>('doses');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: any[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setRawData(data);
      setPreview(data.slice(0, 5)); // Show first 5 rows
    };
    reader.readAsBinaryString(file);
  };

  const processImport = async () => {
    if (rawData.length === 0) return;
    setLoading(true);
    try {
      const res = await bulkImportAction(importType, rawData);
      setResults(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = (type: ImportType) => ({
    flex: 1,
    padding: '1.5rem',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: importType === type ? 'rgba(0, 168, 181, 0.05)' : 'white',
    border: `2px solid ${importType === type ? 'var(--primary-teal)' : 'var(--border)'}`,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    alignItems: 'center',
    textAlign: 'center' as const
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Importación Masiva</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Automatice la carga de datos mediante archivos Excel o CSV con trazabilidad garantizada.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
        
        {/* LEFT PANEL: CONFIGURATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="clean-panel">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Database size={20} color="var(--primary-teal)" />
              1. Seleccione Instancia
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div onClick={() => setImportType('companies')} style={cardStyle('companies')}>
                <Shield size={24} color={importType === 'companies' ? 'var(--primary-teal)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Empresas / OSR</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carga de entidades y responsables.</div>
                </div>
              </div>
              <div onClick={() => setImportType('workers')} style={cardStyle('workers')}>
                <Users size={24} color={importType === 'workers' ? 'var(--primary-teal)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Trabajadores (TOE)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carga masiva de personal expuesto.</div>
                </div>
              </div>
              <div onClick={() => setImportType('doses')} style={cardStyle('doses')}>
                <ClipboardList size={24} color={importType === 'doses' ? 'var(--primary-teal)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Reportes de Dosis</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carga de lecturas mensuales por ID.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="clean-panel">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} color="var(--primary-teal)" />
              2. Descargar Plantillas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="/templates/plantilla_empresas_osr.csv" download className="btn" style={{ background: '#f1f5f9', fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                <FileText size={16} /> Plantilla Empresas y OSR
              </a>
              <a href="/templates/plantilla_trabajadores.csv" download className="btn" style={{ background: '#f1f5f9', fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                <FileText size={16} /> Plantilla Trabajadores TOE
              </a>
              <a href="/templates/plantilla_dosis.csv" download className="btn" style={{ background: '#f1f5f9', fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                <FileText size={16} /> Plantilla Reporte de Dosis
              </a>
            </div>
          </section>

          <section className="clean-panel">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Fingerprint size={20} color="var(--primary-teal)" />
              Lógica de Asociación
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              El sistema utilizará el <strong>RIF</strong> o <strong>Cédula</strong> para verificar si la entidad o persona ya existe. 
              Se mantendrá el historial auditado en todo momento.
            </p>
          </section>
        </div>

        {/* RIGHT PANEL: UPLOAD & PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="clean-panel" style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--border)', background: 'var(--bg-main)' }}>
            <input 
              type="file" 
              id="file-upload" 
              hidden 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 168, 181, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary-teal)' }}>
                <Upload size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {file ? file.name : 'Subir archivo de datos'}
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Arrastra tu archivo Excel o CSV aquí o haz clic para buscar.</p>
              <div className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 2rem' }}>
                Seleccionar Archivo
              </div>
            </label>
          </div>

          {preview.length > 0 && (
            <div className="clean-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Pre-visualización de Datos</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>MUESTRA INICIAL</span>
              </div>
              <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
                <table style={{ minWidth: '100%', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} style={{ padding: '1rem 1.5rem' }}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} style={{ fontWeight: 600, padding: '1rem 1.5rem' }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderTop: '1px solid var(--border)' }}>
                <button 
                  onClick={processImport}
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ gap: '0.75rem', padding: '0.75rem 2.5rem' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  {loading ? 'Procesando...' : 'Confirmar e Importar'}
                </button>
              </div>
            </div>
          )}

          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="clean-panel" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--state-safe)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <CheckCircle2 size={32} color="var(--state-safe)" />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--state-safe)' }}>Procesamiento Finalizado</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Se han procesado {results.success} registros correctamente.</p>
                  </div>
                </div>
                <RegulatoryReportButton 
                  month={new Date().getMonth() + 1} 
                  year={new Date().getFullYear()} 
                  tenantName="Laboratorio Central"
                />
              </div>

              {results.errors.length > 0 && (
                <div className="clean-panel" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--state-danger)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <AlertCircle size={32} color="var(--state-danger)" />
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--state-danger)' }}>Errores Detectados ({results.errors.length})</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Los siguientes registros no pudieron ser procesados:</p>
                    </div>
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {results.errors.map((err, idx) => (
                      <div key={idx} style={{ fontSize: '0.8125rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--state-danger)', fontWeight: 800 }}>Fila {idx + 1}:</span> {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .animate-spin {
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
