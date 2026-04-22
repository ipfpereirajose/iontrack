'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NewCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    address: '',
    contact_phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In a real app, we'd get the tenant_id from the user's session
      // For this demo, we'll need to handle it properly via server actions or session context
      const { error: insertError } = await supabase
        .from('companies')
        .insert([
          {
            name: formData.name,
            tax_id: formData.tax_id,
            address: formData.address,
            contact_phone: formData.contact_phone,
            // tenant_id: ... will be handled by RLS if configured with triggers or set manually
          }
        ]);

      if (insertError) throw insertError;

      router.push('/companies');
      router.refresh();
    } catch (err) {
      setError((err as Error).message || 'Error al registrar la empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href="/lab/companies" className="nav-link" style={{ display: 'inline-flex', width: 'auto', marginBottom: '1rem', padding: '0.5rem 0' }}>
          <ArrowLeft size={18} />
          Volver a la lista
        </Link>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Nueva Empresa Cliente</h1>
        <p style={{ color: 'var(--text-muted)' }}>Registra una nueva entidad para comenzar a gestionar su personal expuesto.</p>
      </header>

      {error && (
        <div className="glass-panel" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Razón Social / Nombre</label>
            <input 
              required
              type="text" 
              placeholder="Ej: Clínica Metropolitana"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '8px', 
                padding: '0.75rem 1rem', 
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>RIF / Identificación Fiscal</label>
            <input 
              required
              type="text" 
              placeholder="J-12345678-0"
              value={formData.tax_id}
              onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '8px', 
                padding: '0.75rem 1rem', 
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Dirección Física</label>
          <textarea 
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: '8px', 
              padding: '0.75rem 1rem', 
              color: 'white',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '300px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Teléfono de Contacto</label>
          <input 
            type="text" 
            placeholder="+58 212..."
            value={formData.contact_phone}
            onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: '8px', 
              padding: '0.75rem 1rem', 
              color: 'white',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            disabled={loading}
            type="submit" 
            className="nav-link active" 
            style={{ 
              padding: '0.75rem 2rem', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? 'Registrando...' : 'Registrar Empresa'}
          </button>
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
