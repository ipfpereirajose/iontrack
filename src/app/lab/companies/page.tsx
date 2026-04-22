import { createClient } from '@supabase/supabase-js';
import { Building2, Plus, Phone, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function CompaniesPage() {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true });

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Empresas Clientes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona los hospitales, clínicas e industrias a las que prestas servicio.</p>
        </div>
        <Link href="/lab/companies/new" className="nav-link active" style={{ padding: '0.75rem 1.5rem' }}>
          <Plus size={20} />
          Nueva Empresa
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {!companies || companies.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <Building2 size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-muted)' }}>No has registrado ninguna empresa todavía.</p>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{company.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RIF: {company.tax_id}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <Phone size={14} />
                  {company.contact_phone || 'Sin teléfono'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <Users size={14} />
                  Ver trabajadores vinculados
                </div>
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Link href={`/companies/${company.id}`} className="nav-link" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                  Detalles
                  <ChevronRight size={16} />
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
