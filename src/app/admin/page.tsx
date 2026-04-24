import { Users, DollarSign, Activity, AlertTriangle, Plus, Settings } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function SuperAdminHomePage() {
  const supabase = await createClient();

  // 1. Fetch Global Stats
  const { count: tenantsCount } = await supabase
    .from('tenants')
    .select('*', { count: 'exact', head: true });

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Calculate global revenue (mock logic based on fee)
  const { data: revenueData } = await supabase
    .from('tenants')
    .select('monthly_fee')
    .eq('billing_status', 'active');
  
  const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.monthly_fee) || 0), 0) || 0;

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Bienvenido, SuperAdmin</h1>
          <p style={{ color: 'var(--text-muted)' }}>Estado global de la infraestructura I.O.N.T.R.A.C.K.</p>
        </div>
        <Link href="/admin/tenants/new" className="btn btn-primary">
          <Plus size={20} />
          Nuevo Laboratorio
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Labs Activos</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{tenantsCount || 0}</div>
          <div className="badge-success" style={{ display: 'inline-flex', marginTop: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>Operativo</div>
        </div>

        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ingresos Mensuales</span>
            <DollarSign size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>${totalRevenue.toLocaleString()}</div>
          <div className="badge-success" style={{ display: 'inline-flex', marginTop: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>+12% vs mes ant.</div>
        </div>

        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Salud del Sistema</span>
            <Activity size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>99.9%</div>
          <div className="badge-success" style={{ display: 'inline-flex', marginTop: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>Uptime Estable</div>
        </div>

        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Incidentes</span>
            <AlertTriangle size={20} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>0</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Sin reportes críticos</div>
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Laboratorios bajo Gestión</h2>
          <Link href="/admin/tenants" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
        </div>
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: 'none', background: 'rgba(255,255,255,0.02)' }}>
          {!tenants || tenants.length === 0 ? (
             <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No hay laboratorios registrados en el sistema.</p>
             </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Laboratorio</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Slug</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Estatus</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Tarifa</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{tenant.name}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{tenant.slug}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span className={tenant.billing_status === 'active' ? 'badge badge-success' : 'badge badge-danger'}>
                        {tenant.billing_status === 'active' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>${Number(tenant.monthly_fee).toLocaleString()}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <Link href={`/admin/tenants/${tenant.id}`} className="nav-link" style={{ display: 'inline-flex', padding: '0.5rem', width: 'auto' }}>
                        <Settings size={18} />
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
