'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    lab_code: '',
    monthly_fee: 300,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('tenants')
        .insert([
          {
            name: formData.name,
            slug: formData.slug.toLowerCase(),
            lab_code: formData.lab_code.toUpperCase(),
            monthly_fee: formData.monthly_fee,
          }
        ]);

      if (insertError) throw insertError;

      router.push('/tenants');
      router.refresh();
    } catch (err) {
      setError((err as Error).message || 'Error al crear el laboratorio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href="/admin/tenants" className="nav-link" style={{ display: 'inline-flex', width: 'auto', marginBottom: '1rem', padding: '0.5rem 0' }}>
          <ArrowLeft size={18} />
          Volver a la lista
        </Link>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Nuevo Laboratorio</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configura una nueva instancia de I.O.N.T.R.A.C.K. para un laboratorio asociado.</p>
      </header>

      {error && (
        <div className="glass-panel" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nombre Comercial</label>
            <input 
              required
              type="text" 
              placeholder="Ej: Laboratorio Central"
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
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Identificador (Slug)</label>
            <input 
              required
              type="text" 
              placeholder="ej: lab-central"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value.replace(/\s+/g, '-').toLowerCase()})}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Código del Laboratorio (Trace ID) *</label>
            <input 
              required
              type="text" 
              placeholder="Ej: LAB-MET"
              value={formData.lab_code}
              onChange={(e) => setFormData({...formData, lab_code: e.target.value.toUpperCase()})}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '8px', 
                padding: '0.75rem 1rem', 
                color: 'white',
                outline: 'none',
                fontWeight: 800
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Identificador raíz para toda la trazabilidad (Ej: L001)</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '300px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cuota Mensual (USD)</label>
          <input 
            required
            type="number" 
            value={formData.monthly_fee}
            onChange={(e) => setFormData({...formData, monthly_fee: parseInt(e.target.value)})}
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
            {loading ? 'Guardando...' : 'Crear Laboratorio'}
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
