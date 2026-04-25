'use client';

import { UserPlus, ArrowLeft, Save, Loader2, Fingerprint } from 'lucide-react';
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
        padding: '0.75rem 2.5rem', 
        border: 'none', 
        cursor: pending ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderRadius: '12px',
        fontWeight: 700
      }}
    >
      {pending ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const labelStyle = { 
    fontSize: '0.75rem', 
    fontWeight: 700, 
    color: 'var(--text-muted)', 
    textTransform: 'uppercase' as const, 
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
    display: 'block'
  };

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

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href={`/lab/companies/${companyId}/workers`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          Volver a la lista
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Registro de TOE</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Inscribe a un nuevo trabajador y asigna su código de trazabilidad.</p>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.25rem', borderRadius: '16px', color: '#f87171', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <form action={clientAction} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem', borderRadius: '24px' }}>
        
        {/* IDENTIFICACIÓN DE TRAZABILIDAD */}
        <div style={{ background: 'rgba(6, 182, 212, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px dashed rgba(6, 182, 212, 0.3)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            <Fingerprint size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Trazabilidad Unívoca</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Código de Trabajador *</label>
              <input 
                required
                name="worker_code"
                type="text" 
                placeholder="Ej: 001"
                style={{ ...inputStyle, border: '1px solid rgba(6, 182, 212, 0.3)', fontWeight: 800, color: 'var(--primary)' }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Correlativo lineal dentro de la empresa.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', width: '100%' }}>
                ID Final: <span style={{ color: 'white', fontWeight: 700 }}>LAB-EMP-OSR-CODE</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Nombres *</label>
            <input required name="first_name" type="text" placeholder="Ej: Juan Carlos" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Apellidos *</label>
            <input required name="last_name" type="text" placeholder="Ej: Pérez Rodríguez" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Cédula / ID Identidad *</label>
            <input required name="ci" type="text" placeholder="V-12345678" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Correo Electrónico (Opcional)</label>
            <input name="email" type="email" placeholder="juan.perez@clinica.com" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Cargo / Área de Trabajo</label>
          <input name="position" type="text" placeholder="Ej: Técnico Radiólogo - Medicina Nuclear" style={inputStyle} />
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
