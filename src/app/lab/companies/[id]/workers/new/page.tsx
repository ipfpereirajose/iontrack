'use client';

import { UserPlus, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createWorker } from '../actions';
import { useFormStatus } from 'react-dom';
import { useState, use } from 'react';

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
      {pending ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
      {pending ? 'Registrando...' : 'Registrar TOE'}
    </button>
  );
}

export default function NewWorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = use(params);
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    try {
      await createWorker(companyId, formData);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el trabajador');
    }
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href={`/lab/companies/${companyId}/workers`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={18} />
          Volver a la lista
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Registro de TOE</h1>
        <p style={{ color: 'var(--text-muted)' }}>Inscribe a un nuevo Trabajador Ocupacionalmente Expuesto en el sistema de vigilancia.</p>
      </header>

      {error && (
        <div className="glass-panel" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.1)' }}>
          {error}
        </div>
      )}

      <form action={clientAction} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombres</label>
            <input 
              required
              name="first_name"
              type="text" 
              placeholder="Ej: Juan Carlos"
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
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apellidos</label>
            <input 
              required
              name="last_name"
              type="text" 
              placeholder="Ej: Pérez Rodríguez"
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cédula / ID Identidad</label>
            <input 
              required
              name="ci"
              type="text" 
              placeholder="V-12345678"
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
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correo Electrónico (Opcional)</label>
            <input 
              name="email"
              type="email" 
              placeholder="juan.perez@clinica.com"
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
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cargo / Área de Trabajo</label>
          <input 
            name="position"
            type="text" 
            placeholder="Ej: Técnico Radiólogo - Medicina Nuclear"
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
