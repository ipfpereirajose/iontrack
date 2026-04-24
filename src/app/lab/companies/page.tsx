import { Building2, Plus, Phone, Users, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import Link from 'next/link';

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const tenantId = profile?.tenant_id;

  // 2. Fetch Companies for this tenant
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*, toe_workers(count)')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Empresas Clientes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona las entidades a las que prestas servicio dosimétrico.</p>
        </div>
        <Link href="/lab/companies/new" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700 }}>
          <Plus size={20} />
          Nueva Empresa
        </Link>
      </header>

      {error && (
        <div className="glass-panel" style={{ color: 'var(--danger)', marginBottom: '2rem' }}>
          Error al cargar empresas: {error.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {!companies || companies.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.02)' }}>
            <Building2 size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Sin empresas registradas</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Comienza registrando tu primera empresa cliente.</p>
            <Link href="/lab/companies/new" className="btn btn-primary">Registrar Empresa Now</Link>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
                  <Building2 size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  {company.tax_id}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>{company.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={14} />
                  {Array.isArray(company.toe_workers) ? company.toe_workers[0].count : 0} Trabajadores Expuestos
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <Phone size={14} />
                  {company.contact_phone || 'Sin teléfono'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link href={`/lab/companies/${company.id}`} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', justifyContent: 'center', fontSize: '0.875rem' }}>
                  Gestionar
                </Link>
                <Link href={`/lab/companies/${company.id}/workers`} className="btn" style={{ flex: 1, background: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)', justifyContent: 'center', fontSize: '0.875rem' }}>
                  TOEs
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export const revalidate = 0;
