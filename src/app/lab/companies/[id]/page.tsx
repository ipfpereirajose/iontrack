import { createClient } from '@/utils/supabase/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getCurrentProfile } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Building2, MapPin, Mail, Phone, Fingerprint } from 'lucide-react';

export default async function CompanyDetailsPage({ params }: { params: { id: string } }) {
  const { id: companyId } = await params;
  const { profile } = await getCurrentProfile();
  const tenantId = profile?.tenant_id;
  
  if (!tenantId) return <div style={{ color: 'white', padding: '2rem' }}>No autorizado</div>;

  const adminSupabase = getServiceSupabase();

  const { data: company, error } = await adminSupabase
    .from('companies')
    .select('*, tenants(lab_code)')
    .eq('id', companyId)
    .eq('tenant_id', tenantId)
    .single();

  if (!company) {
    return (
      <div style={{ padding: '2rem', color: 'white' }}>
        <h2>Error al cargar la empresa</h2>
        <p>ID Buscado: {companyId}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
        <Link href="/lab/companies" className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver</Link>
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href="/lab/companies" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={18} />
          Volver a Empresas
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>{company.name}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Detalles e Información de la Empresa Cliente.</p>
          </div>
          <Link href={`/lab/companies/${companyId}/workers`} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700 }}>
            Ver Trabajadores (TOE)
          </Link>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} color="var(--primary)" />
          Información Fiscal y Operativa
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>RIF / Tax ID</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{company.tax_id}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Código Interno Lab</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Fingerprint size={16} color="var(--primary)" />
              {company.company_code || 'N/A'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Sector</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{company.sector || 'N/A'}</p>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border)', margin: '2rem 0' }} />

        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={20} color="var(--primary)" />
          Contacto y Ubicación
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Email Principal</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={16} color="var(--text-muted)" />
              {company.email || 'N/A'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Teléfono</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={16} color="var(--text-muted)" />
              {company.phone_local || company.phone_mobile || 'N/A'}
            </p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Dirección</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {company.address ? `${company.address}, ${company.parish}, ${company.municipality}, ${company.state}` : 'N/A'}
            </p>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border)', margin: '2rem 0' }} />

        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Oficial de Seguridad Radiológica (OSR)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Nombre OSR</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{company.rep_first_name} {company.rep_last_name}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cédula OSR</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{company.osr_nac}-{company.rep_ci}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Email OSR</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{company.rep_email || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
