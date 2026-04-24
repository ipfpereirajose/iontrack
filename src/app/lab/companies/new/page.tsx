'use client';

import { Building2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createCompany } from '../actions';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      disabled={pending}
      type="submit" 
      className="btn btn-primary" 
      style={{ 
        padding: '0.75rem 2rem', 
        border: 'none', 
        cursor: pending ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderRadius: '12px',
        fontWeight: 700
      }}
    >
      {pending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
      {pending ? 'Registrando...' : 'Registrar Empresa'}
    </button>
  );
}

export default function NewCompanyPage() {
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    try {
      await createCompany(formData);
    } catch (err: any) {
      setError(err.message || 'Error al registrar la empresa');
    }
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href="/lab/companies" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={18} />
          Volver a la lista
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Nueva Empresa Cliente</h1>
        <p style={{ color: 'var(--text-muted)' }}>Registra una nueva entidad para comenzar a gestionar su personal expuesto.</p>
      </header>

      {error && (
        <div className="glass-panel" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.1)' }}>
          {error}
        </div>
      )}

      <form action={clientAction} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Razón Social / Nombre</label>
            <input 
              required
              name="name"
              type="text" 
              placeholder="Ej: Clínica Metropolitana"
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                padding: '1rem', 
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RIF / Identificación Fiscal</label>
            <input 
              required
              name="tax_id"
              type="text" 
              placeholder="J-12345678-0"
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                padding: '1rem', 
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dirección Física</label>
          <textarea 
            name="address"
            rows={3}
            placeholder="Dirección completa de la sede principal..."
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              padding: '1rem', 
              color: 'white',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '350px' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teléfono de Contacto</label>
          <input 
            name="contact_phone"
            type="text" 
            placeholder="+58 212..."
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              padding: '1rem', 
              color: 'white',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <SubmitButton />
        </div>
      </form>
      
      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
