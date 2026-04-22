import { getServiceSupabase } from '@/lib/supabase';
import { Users, Plus, ExternalLink, Shield } from 'lucide-react';
import Link from 'next/link';

export default async function TenantsPage() {
  const supabase = getServiceSupabase();
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Laboratorios (Tenants)</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestión global de los centros de dosimetría afiliados.</p>
        </div>
        <Link href="/tenants/new" className="nav-link active" style={{ padding: '0.75rem 1.5rem' }}>
          <Plus size={20} />
          Nuevo Laboratorio
        </Link>
      </header>

      {error && (
        <div className="glass-panel" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', marginBottom: '2rem' }}>
          Error al cargar laboratorios: {error.message}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nombre del Laboratorio</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>ID / Slug</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Estatus</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tarifa</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!tenants || tenants.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay laboratorios registrados todavía.
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="glass-panel" style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        <Shield size={16} color="var(--primary)" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{tenant.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                    {tenant.slug}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span className={`badge ${tenant.billing_status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {tenant.billing_status}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    ${tenant.monthly_fee}/mes
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <Link href={`/tenants/${tenant.id}`} className="nav-link" style={{ padding: '0.5rem', border: '1px solid var(--border-glass)', background: 'none' }}>
                        <Settings size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Re-fetch data on every request for this dashboard page
export const revalidate = 0;
