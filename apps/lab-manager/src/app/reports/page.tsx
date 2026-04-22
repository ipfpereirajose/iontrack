import { FileText, Download, ShieldCheck, History, FileJson } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Reportes y Cumplimiento Normativo</h1>
        <p style={{ color: 'var(--text-muted)' }}>Generación de archivos oficiales para entes reguladores y auditorías internas.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Regulatory Export */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Exportación Normativa</h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Genera los archivos estructurados requeridos por las autoridades nacionales (CSV/XML) con firma digital de integridad.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="nav-link" style={{ background: 'var(--bg-glass)', justifyContent: 'space-between', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Download size={18} />
                <span>Exportar Periodo (XML Oficial)</span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>ESTÁNDAR V1.2</span>
            </button>
            
            <button className="nav-link" style={{ background: 'var(--bg-glass)', justifyContent: 'space-between', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileJson size={18} />
                <span>Consolidado Anual (JSON)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <History size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Trazabilidad e Integridad</h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Consulta el registro inmutable de cada cambio realizado en la base de datos de dosis.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ background: 'var(--primary)', width: '4px', borderRadius: '2px' }}></div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dosis Aprobada (ID: #892)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Por: Oficial Seguridad | IP: 192.168.1.45</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>21/04/2026 23:55</div>
              </div>
            </div>
            
            <button className="nav-link" style={{ padding: '0.5rem', justifyContent: 'center', fontSize: '0.875rem' }}>
              Ver Auditoría Completa
            </button>
          </div>
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Historial de Exportaciones</h2>
        <div className="glass-panel" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Archivo</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Periodo</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Generado por</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Hash de Integridad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1.25rem 1.5rem' }}>iontrack_export_mar2026.xml</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>Marzo 2026</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>Administrador</td>
                <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  sha256:7a8b9c...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
