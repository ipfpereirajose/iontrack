import { createClient } from '@supabase/supabase-js';
import { History, Download, Calendar, TrendingUp } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function HistoryPage() {
  const { data: doses, error } = await supabase
    .from('doses')
    .select(`
      id,
      month,
      year,
      hp10,
      toe_workers (
        first_name,
        last_name,
        ci
      )
    `)
    .eq('status', 'approved')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Historial Dosimétrico</h1>
          <p style={{ color: 'var(--text-muted)' }}>Registro histórico de lecturas validadas para todo el personal.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          Exportar Historial (Excel)
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '0', background: 'white', border: 'none', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Periodo</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Trabajador</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Dosis Hp10</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {!doses || doses.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay historial de dosis disponible.
                  </td>
                </tr>
              ) : (
                doses.map((dose: any) => (
                  <tr key={dose.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                      {dose.month < 10 ? `0${dose.month}` : dose.month}/{dose.year}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{dose.toe_workers?.first_name} {dose.toe_workers?.last_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dose.toe_workers?.ci}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ fontWeight: 700, color: dose.hp10 > 1.5 ? 'var(--danger)' : 'var(--text-main)' }}>
                        {dose.hp10}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>mSv</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', fontSize: '0.7rem', fontWeight: 700, color: 'var(--secondary)' }}>CERTIFICADO</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ background: 'white', border: 'none' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--primary)" />
              Dosis Acumulada Anual
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Límite Legal (Anual)</span>
                <span style={{ fontWeight: 700 }}>20.0 mSv</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '15%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>El personal se encuentra dentro de los rangos de seguridad establecidos.</p>
            </div>
          </div>

          <div className="glass-panel" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Soporte Técnico</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '1.5rem' }}>¿Tienes dudas sobre una lectura o necesitas un reporte especial?</p>
            <button style={{ background: 'white', color: 'var(--primary)', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', width: '100%' }}>Contactar Laboratorio</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 0;
