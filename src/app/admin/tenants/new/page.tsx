'use client';

import { Building2, User, MapPin, Phone, Mail, ShieldCheck, ArrowLeft, Save, Info } from 'lucide-react';
import Link from 'next/link';
import { createTenantAction } from '../actions';
import TerritorialSelector from '@/components/admin/TerritorialSelector';

export default function NewTenantPage() {
  const handleSubmit = async (formData: FormData) => {
    const result = await createTenantAction(formData);
    if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href="/admin/tenants" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          Volver a Laboratorios
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Registrar Nuevo Laboratorio</h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete todos los campos para dar de alta una nueva entidad en la infraestructura nacional.</p>
      </header>

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* SECCION 1: DATOS DEL LABORATORIO */}
        <section className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <Building2 size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Información del Laboratorio</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nombre del Laboratorio</label>
              <input name="name" required placeholder="Ej: Laboratorio Central de Dosimetría" style={inputStyle} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>RIF</label>
              <input name="rif" required placeholder="Ej: J-12345678-9" style={inputStyle} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Dirección Fiscal</label>
              <textarea name="address" required placeholder="Dirección completa detallada..." style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
            </div>
            
            <TerritorialSelector inputStyle={inputStyle} />
          </div>
        </section>

        {/* SECCION 2: REPRESENTANTE LEGAL */}
        <section className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <User size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Representante Legal</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nombres</label>
              <input name="rep_first_name" required placeholder="Nombres del representante" style={inputStyle} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Apellidos</label>
              <input name="rep_last_name" required placeholder="Apellidos del representante" style={inputStyle} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>CI del Representante</label>
              <input name="rep_ci" required placeholder="V-12.345.678" style={inputStyle} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Teléfono del Representante</label>
              <input name="rep_phone" required placeholder="Ej: 0414-1234567" style={inputStyle} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Correo del Representante</label>
              <input name="rep_email" required type="email" placeholder="correo.representante@ejemplo.com" style={inputStyle} />
            </div>
          </div>
        </section>

        {/* SECCION 3: CONTACTO Y ACCESO */}
        <section className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Contacto y Credenciales de Acceso</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Teléfono Móvil (Laboratorio)</label>
              <input name="mobile_phone" required placeholder="Ej: 0412-1234567" style={inputStyle} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Teléfono Oficina (Opcional)</label>
              <input name="office_phone" placeholder="Ej: 0212-1234567" style={inputStyle} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Correo Electrónico de Acceso</label>
              <input name="email" required type="email" placeholder="admin@laboratorio.com" style={inputStyle} />
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <Info size={14} />
                Se enviará un enlace de verificación y asignación de contraseña a esta dirección.
              </p>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', marginBottom: '4rem' }}>
          <Link href="/admin/tenants" className="btn btn-secondary" style={{ padding: '1rem 2rem' }}>
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
            <Save size={20} />
            Registrar Laboratorio e Invitar
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#FFFFFF',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '0.875rem 1rem',
  color: 'var(--text-main)',
  fontSize: '0.9375rem',
  outline: 'none',
  transition: 'all 0.2s',
  '&:focus': {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 0 3px rgba(0, 168, 181, 0.1)'
  }
} as any;
