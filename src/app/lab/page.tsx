import { Building2, Users, ClipboardCheck, AlertTriangle, Download, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import Link from 'next/link';

export default async function LabHomePage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const tenantId = profile?.tenant_id;

  // 2. Fetch Stats
  // Total Companies
  const { count: companiesCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  // Total Workers (TOEs)
  const { count: workersCount } = await supabase
    .from('toe_workers')
    .select('*, companies!inner(*)', { count: 'exact', head: true })
    .eq('companies.tenant_id', tenantId);

  // Pending Doses
  const { data: pendingDoses, count: pendingCount } = await supabase
    .from('doses')
    .select(`
      id, hp10, month, year,
      toe_workers!inner (
        first_name, last_name, ci,
        companies!inner (name, tenant_id)
      )
    `)
    .eq('status', 'pending')
    .eq('toe_workers.companies.tenant_id', tenantId)
    .limit(5);

  // Critical Alerts (80% threshold)
  const { count: alertsCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('type', 'threshold_alert')
    .eq('is_read', false);

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard del Laboratorio</h1>
        <p style={{ color: 'var(--text-muted)' }}>Bienvenido al centro operativo de dosimetría.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Empresas</span>
            <Building2 size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{companiesCount || 0}</div>
          <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>Clientes Activos</div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trabajadores (TOE)</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{workersCount || 0}</div>
          <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>Bajo Vigilancia</div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pendientes Validar</span>
            <ClipboardCheck size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{pendingCount || 0}</div>
          <div className={pendingCount && pendingCount > 0 ? 'badge badge-warning' : 'badge badge-success'} style={{ marginTop: '0.5rem' }}>
            {pendingCount && pendingCount > 0 ? 'Atención Requerida' : 'Al día'}
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alertas Críticas</span>
            <AlertTriangle size={20} color={alertsCount && alertsCount > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{alertsCount || 0}</div>
          <div className={alertsCount && alertsCount > 0 ? 'badge badge-danger' : 'badge badge-success'} style={{ marginTop: '0.5rem' }}>
            {alertsCount && alertsCount > 0 ? 'Umbral Superado' : 'Sin incidencias'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Cola de Validación Reciente</h2>
          <div className="glass-panel" style={{ padding: '0' }}>
            {!pendingDoses || pendingDoses.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>No hay dosis pendientes de validación.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Trabajador</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Empresa</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Dosis (mSv)</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoses.map((dose: any) => (
                    <tr key={dose.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                        {dose.toe_workers?.first_name} {dose.toe_workers?.last_name}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {dose.toe_workers?.companies?.name}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>{dose.hp10}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <Link href="/lab/validation" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                          Gestionar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Estado e Infraestructura</h2>
          <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary)' }}></div>
              <span style={{ fontWeight: 600 }}>Agente Local</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>ID Agente:</span>
                <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>AG-7729</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sincronización:</span>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Activa (30s)</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'black', border: 'none' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Software de Ingesta</h3>
            <p style={{ fontSize: '0.8125rem', opacity: 0.9, marginBottom: '1.25rem', fontWeight: 600 }}>Sincroniza dosis offline de forma segura.</p>
            <Link href="/downloads/iontrack-agent.exe" className="btn" style={{ background: 'white', color: 'black', width: '100%', justifyContent: 'center' }}>
              <Download size={18} />
              Descargar .EXE
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
