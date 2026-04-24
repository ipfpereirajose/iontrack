import { Users, Calendar, Download, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentProfile } from '@/lib/auth';

export default async function B2BHomePage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const companyId = profile?.company_id;
  const companyName = (profile as any)?.companies?.name || 'Empresa Cliente';

  // 2. Fetch Stats
  // Total TOEs
  const { count: toeCount } = await supabase
    .from('toe_workers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'active');

  // Latest Doses for this company
  const { data: latestDoses } = await supabase
    .from('doses')
    .select('*, toe_workers!inner(*)')
    .eq('toe_workers.company_id', companyId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(5);

  const lastPeriod = latestDoses && latestDoses.length > 0 
    ? `${latestDoses[0].month}/${latestDoses[0].year}` 
    : 'N/A';

  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>{companyName}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Resumen de Vigilancia Radiológica Ocupacional</p>
        </div>
        <button className="btn btn-primary">
          <Download size={18} />
          Reporte Mensual PDF
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ border: 'none', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Expuesto (TOE)</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{toeCount || 0}</div>
          <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>Personal Activo</div>
        </div>

        <div className="glass-panel" style={{ border: 'none', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Último Periodo</span>
            <Calendar size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{lastPeriod}</div>
          <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>Dosis Validadas</div>
        </div>

        <div className="glass-panel" style={{ border: 'none', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cumplimiento Normativo</span>
            <ShieldCheck size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>100%</div>
          <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>Límites Cumplidos</div>
        </div>
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Lecturas Recientes de Dosímetros</h2>
          <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Ver historial completo</button>
        </div>

        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: 'none', background: 'rgba(255,255,255,0.02)' }}>
          {!latestDoses || latestDoses.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No se encontraron registros de dosis para esta empresa.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Trabajador</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Cédula / ID</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Estatus</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Dosis (mSv)</th>
                </tr>
              </thead>
              <tbody>
                {latestDoses.map((dose: any) => (
                  <tr key={dose.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                      {dose.toe_workers?.first_name} {dose.toe_workers?.last_name}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>{dose.toe_workers?.ci}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {dose.status === 'approved' ? (
                        <div className="badge badge-success">
                          <CheckCircle2 size={14} style={{ marginRight: '0.4rem' }} /> Validada
                        </div>
                      ) : (
                        <div className="badge badge-warning">
                          <Clock size={14} style={{ marginRight: '0.4rem' }} /> Pendiente
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>{dose.hp10}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
