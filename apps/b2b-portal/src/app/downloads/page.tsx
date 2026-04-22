import { Download, FileText, Calendar, Search, QrCode } from 'lucide-react';

export default function DownloadsPage() {
  const reports = [
    { id: 1, name: 'Reporte Mensual de Dosimetría', period: 'Marzo 2026', type: 'PDF', date: '05/04/2026' },
    { id: 2, name: 'Certificado Individual de Dosis', period: 'Anual 2025', type: 'PDF', date: '15/01/2026' },
    { id: 3, name: 'Reporte Mensual de Dosimetría', period: 'Febrero 2026', type: 'PDF', date: '03/03/2026' },
  ];

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Centro de Descargas</h1>
        <p style={{ color: 'var(--text-muted)' }}>Accede a tus reportes oficiales y certificados con validez legal.</p>
      </header>

      <div className="glass-panel" style={{ background: 'white', border: 'none', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Buscar por periodo o tipo de reporte..." style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }} />
          </div>
          <button className="btn-primary">Filtrar</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.map((report) => (
            <div key={report.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '0.75rem', borderRadius: '10px', color: 'var(--primary)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{report.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {report.period}</span>
                    <span>{report.type}</span>
                    <span>Subido: {report.date}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>
                  <QrCode size={16} />
                  Ver QR
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                  <Download size={16} />
                  Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
        <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px' }}>
          <QrCode size={32} color="var(--primary)" />
        </div>
        <div>
          <h4 style={{ fontWeight: 700, color: '#0369a1', marginBottom: '0.25rem' }}>Validación de Documentos</h4>
          <p style={{ fontSize: '0.875rem', color: '#0c4a6e' }}>
            Todos nuestros reportes incluyen un código QR único que permite a los inspectores de seguridad radiológica verificar la autenticidad del documento directamente en nuestros servidores.
          </p>
        </div>
      </div>
    </div>
  );
}
