import { Download, FileText, ShieldCheck, Archive, Search, FileDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function CompanyDownloadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get Company Info
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, companies(name, company_code)')
    .eq('id', user.id)
    .single();

  const company = profile?.companies;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Centro de Descargas</h1>
        <p style={{ color: 'var(--text-muted)' }}>Acceda a sus certificados oficiales, reportes mensuales y documentación técnica.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* CERTIFICADOS */}
        <div className="clean-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(0, 168, 181, 0.1)', borderRadius: '15px', width: 'fit-content' }}>
            <ShieldCheck size={28} color="var(--primary-teal)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Certificados de Dosis</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Descargue los certificados individuales validados de su personal expuesto (TOE).
            </p>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 'auto', gap: '0.75rem' }}>
            <Search size={18} /> Consultar Certificados
          </button>
        </div>

        {/* REPORTES MENSUALES */}
        <div className="clean-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '15px', width: 'fit-content' }}>
            <Archive size={28} color="#a855f7" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Históricos Mensuales</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Reportes consolidados de la empresa por mes y año en formato Excel/PDF.
            </p>
          </div>
          <button className="btn" style={{ marginTop: 'auto', background: '#f1f5f9', gap: '0.75rem' }}>
            <FileDown size={18} /> Ver Archivo Histórico
          </button>
        </div>

        {/* DOCUMENTACION TECNICA */}
        <div className="clean-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '15px', width: 'fit-content' }}>
            <FileText size={28} color="var(--state-warning)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Manuales y Normas</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Guías de usuario, normativas de protección radiológica y protocolos de emergencia.
            </p>
          </div>
          <button className="btn" style={{ marginTop: 'auto', background: '#f1f5f9', gap: '0.75rem' }}>
            <Download size={18} /> Descargar Guías
          </button>
        </div>

      </div>

      <div className="clean-panel" style={{ marginTop: '3rem', background: '#f8fafc', border: '1px dashed var(--border)', textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
          ¿Necesita un documento especial o un aval oficial firmado por el laboratorio? 
          Contacte directamente con su proveedor de servicios.
        </p>
      </div>
    </div>
  );
}
