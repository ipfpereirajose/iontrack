import { Building2, Users, ClipboardCheck, AlertTriangle, Download, CheckCircle, TrendingUp, ShieldAlert, ArrowRight, Calendar } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import Link from 'next/link';
import DoseChart from '@/components/lab/DoseChart';

export default async function LabHomePage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const tenantId = profile?.tenant_id;

  // Run all queries in parallel for maximum performance
  const [
    { count: companiesCount },
    { count: workersCount },
    { data: pendingDoses, count: pendingCount },
    { data: recentDoses },
    { data: criticalAlerts }
  ] = await Promise.all([
    supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
    supabase
      .from('toe_workers')
      .select('*, companies!inner(*)', { count: 'exact', head: true })
      .eq('companies.tenant_id', tenantId),
    supabase
      .from('doses')
      .select(`id, hp10, month, year, toe_workers!inner(first_name, last_name, ci, companies!inner(name, tenant_id))`)
      .eq('status', 'pending')
      .eq('toe_workers.companies.tenant_id', tenantId)
      .limit(5),
    supabase
      .from('doses')
      .select('hp10, month, year')
      .eq('toe_workers.companies.tenant_id', tenantId)
      .eq('year', new Date().getFullYear())
      .eq('status', 'approved'),
    supabase
      .from('doses')
      .select(`
        id, hp10, month, year,
        toe_workers!inner (
          first_name, last_name,
          companies!inner (name)
        )
      `)
      .eq('toe_workers.companies.tenant_id', tenantId)
      .gte('hp10', 1.328) // 80% of 1.66
      .order('created_at', { ascending: false })
      .limit(3)
  ]);

  // Process Chart Data
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const chartData = months.map((name, index) => {
    const monthDoses = recentDoses?.filter(d => d.month === index + 1) || [];
    const totalDose = monthDoses.reduce((acc, curr) => acc + curr.hp10, 0);
    return { name, value: parseFloat(totalDose.toFixed(4)) };
  });

  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Dashboard General</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Estado operativo y vigilancia dosimétrica del laboratorio.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.25rem', borderRadius: '12px' }}>
            <Calendar size={18} />
            Periodo Actual
          </button>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Empresas</span>
            <Building2 size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900 }}>{companiesCount || 0}</div>
          <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.5rem', fontWeight: 700 }}>● Clientes Activos</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Personal TOE</span>
            <Users size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900 }}>{workersCount || 0}</div>
          <p style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.5rem', fontWeight: 700 }}>● Vigilancia Activa</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pendientes</span>
            <ClipboardCheck size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900 }}>{pendingCount || 0}</div>
          <p style={{ fontSize: '0.75rem', color: pendingCount && pendingCount > 0 ? '#fbbf24' : '#4ade80', marginTop: '0.5rem', fontWeight: 700 }}>
            {pendingCount && pendingCount > 0 ? '⚠️ Acción Requerida' : '✓ Al día'}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alertas Críticas</span>
            <AlertTriangle size={18} color={criticalAlerts?.length ? '#f87171' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: criticalAlerts?.length ? '#f87171' : 'inherit' }}>{criticalAlerts?.length || 0}</div>
          <p style={{ fontSize: '0.75rem', color: criticalAlerts?.length ? '#f87171' : '#4ade80', marginTop: '0.5rem', fontWeight: 700 }}>
            {criticalAlerts?.length ? '🚨 Sobre-exposición' : '✓ Sin incidencias'}
          </p>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
        
        {/* CHART SECTION */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 800 }}>
              <TrendingUp size={20} color="var(--primary)" />
              Tendencia de Carga Dosimétrica
            </h3>
          </div>
          <DoseChart data={chartData} />
        </div>

        {/* RECENT ALERTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              <ShieldAlert size={20} color="#f87171" />
              Notificaciones Críticas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!criticalAlerts || criticalAlerts.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No hay alertas registradas.
                </div>
              ) : (
                criticalAlerts.map((alert: any) => (
                  <div key={alert.id} className="glass-panel" style={{ 
                    padding: '1rem', 
                    borderLeft: `4px solid ${alert.hp10 >= 1.66 ? '#ef4444' : '#f59e0b'}`,
                    background: alert.hp10 >= 1.66 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: alert.hp10 >= 1.66 ? '#f87171' : '#fbbf24' }}>
                        {alert.hp10 >= 1.66 ? 'SOBRE-EXPOSICIÓN' : 'ADVERTENCIA (80%)'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{alert.toe_workers.first_name} {alert.toe_workers.last_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alert.toe_workers.companies.name}</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{alert.hp10}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>mSv</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* QUICK LINKS / INFRASTRUCTURE */}
          <div className="glass-panel" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'black', border: 'none' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem' }}>Agente de Ingesta</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '1.25rem', fontWeight: 600 }}>Descarga la última versión para sincronización offline.</p>
            <Link href="/downloads/iontrack-agent.exe" className="btn" style={{ background: 'white', color: 'black', width: '100%', justifyContent: 'center', fontWeight: 700 }}>
              <Download size={18} />
              Descargar Agente
            </Link>
          </div>
        </div>
      </div>

      {/* RECENT VALIDATIONS */}
      <section style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Pendientes de Validación</h2>
          <Link href="/lab/validation" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          {!pendingDoses || pendingDoses.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p style={{ fontWeight: 600 }}>No hay dosis pendientes. Todo al día.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Trabajador</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Institución</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Periodo</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Dosis</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pendingDoses.map((dose: any) => (
                  <tr key={dose.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>{dose.toe_workers.first_name} {dose.toe_workers.last_name}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{dose.toe_workers.companies.name}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{dose.month}/{dose.year}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{dose.hp10}</span>
                      <span style={{ fontSize: '0.7rem', marginLeft: '0.2rem', color: 'var(--text-muted)' }}>mSv</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <Link href="/lab/validation" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '8px' }}>
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
    </div>
  );
}
