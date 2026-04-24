import { CreditCard, DollarSign, Clock, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const supabase = getServiceSupabase();
  const { data: tenants } = await supabase.from('tenants').select('*');

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CreditCard size={32} color="var(--primary)" />
          Control de Facturación
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitoreo de suscripciones mensuales y gestión de morosidad.</p>
      </header>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <span className="stat-label">Recaudación Total</span>
          <span className="stat-value">$1,200</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mes en curso: Abril 2026</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-label">Pagos Pendientes</span>
          <span className="stat-value" style={{ color: 'var(--accent)' }}>1</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>Laboratorio: Servicios Dosimétricos</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-label">Ingresos Anuales</span>
          <span className="stat-value">$4,800</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>Proyectado 2026</span>
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Estado de Mensualidades</h2>
        <div className="glass-panel" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Laboratorio</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tarifa</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Estatus de Pago</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Próximo Vencimiento</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.map((tenant) => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{tenant.name}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>${tenant.monthly_fee}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {tenant.billing_status === 'active' ? (
                        <CheckCircle size={14} color="var(--secondary)" />
                      ) : (
                        <AlertTriangle size={14} color="var(--danger)" />
                      )}
                      <span className={`badge ${tenant.billing_status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {tenant.billing_status === 'active' ? 'Al día' : 'En Mora'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>
                    05/05/2026
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button className="nav-link" style={{ display: 'inline-flex', padding: '0.5rem 1rem', border: '1px solid var(--border-glass)', background: 'none' }}>
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
