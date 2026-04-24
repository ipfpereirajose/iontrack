'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Database, ArrowRight, Loader2, Fingerprint, Shield, Users, ClipboardList } from 'lucide-react';
import * as XLSX from 'xlsx';

import { bulkImportAction } from './actions';

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
    background: importType === type ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
    border: `2px solid ${importType === type ? 'var(--primary)' : 'transparent'}`,
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
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Database size={20} color="var(--primary)" />
              1. Seleccione Instancia
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div onClick={() => setImportType('companies')} style={cardStyle('companies')}>
                <Shield size={24} color={importType === 'companies' ? 'var(--primary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Empresas / OSR</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carga de entidades y responsables.</div>
                </div>
              </div>
              <div onClick={() => setImportType('workers')} style={cardStyle('workers')}>
                <Users size={24} color={importType === 'workers' ? 'var(--primary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Trabajadores (TOE)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carga masiva de personal expuesto.</div>
                </div>
              </div>
              <div onClick={() => setImportType('doses')} style={cardStyle('doses')}>
                <ClipboardList size={24} color={importType === 'doses' ? 'var(--primary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Reportes de Dosis</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carga de lecturas mensuales por ID.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Fingerprint size={20} color="var(--primary)" />
              Lógica de Asociación
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              El sistema utilizará el <strong>RIF</strong> o <strong>Cédula</strong> para verificar si la entidad o persona ya existe. 
              Si hay coincidencia, se permitirá la asociación a la instalación actual manteniendo el historial auditado.
            </p>
          </section>
        </div>

        {/* RIGHT PANEL: UPLOAD & PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--border)', background: 'rgba(255,255,255,0.01)' }}>
            <input 
              type="file" 
              id="file-upload" 
              hidden 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
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
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Pre-visualización de Datos</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Mostrando primeras 5 filas</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} style={{ padding: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} style={{ padding: '1rem', fontWeight: 600 }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.01)' }}>
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
              <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <CheckCircle2 size={32} color="#22c55e" />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22c55e' }}>Procesamiento Finalizado</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Se han procesado {results.success} registros correctamente.</p>
                  </div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <AlertCircle size={32} color="#f87171" />
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171' }}>Errores Detectados ({results.errors.length})</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Los siguientes registros no pudieron ser procesados:</p>
                    </div>
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {results.errors.map((err, idx) => (
                      <div key={idx} style={{ fontSize: '0.8125rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <span style={{ color: '#f87171', fontWeight: 700 }}>Fila {idx + 1}:</span> {err.message}
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
