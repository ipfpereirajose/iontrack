'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Shield, ArrowLeft, Save, Loader2, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    monthly_fee: 300,
    billing_status: 'active'
  });

  useEffect(() => {
    async function fetchTenant() {
      if (!params.id) return;
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setFormData({
          name: data.name,
          slug: data.slug,
          monthly_fee: data.monthly_fee,
          billing_status: data.billing_status
        });
      }
      setLoading(false);
    }
    fetchTenant();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          name: formData.name,
          slug: formData.slug.toLowerCase(),
          monthly_fee: formData.monthly_fee,
          billing_status: formData.billing_status
        })
        .eq('id', params.id);

      if (updateError) throw updateError;

      router.push('/tenants');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el laboratorio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}><Loader2 className="animate-spin" /> Cargando...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <Link href="/tenants" className="nav-link" style={{ display: 'inline-flex', width: 'auto', marginBottom: '1rem', padding: '0.5rem 0' }}>
          <ArrowLeft size={18} />
          Volver a la lista
        </Link>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Editar Laboratorio</h1>
        <p style={{ color: 'var(--text-muted)' }}>Modifica los parámetros de la instancia o gestiona el estado de acceso.</p>
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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Identificador (Slug)</label>
            <input 
              required
              type="text" 
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cuota Mensual (USD)</label>
            <input 
              required
              type="number" 
              value={formData.monthly_fee}
              onChange={(e) => setFormData({...formData, monthly_fee: parseInt(e.target.value)})}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Estado de la Cuenta</label>
            <select 
              value={formData.billing_status}
              onChange={(e) => setFormData({...formData, billing_status: e.target.value})}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
            >
              <option value="active">Activo (Acceso Total)</option>
              <option value="past_due">Pago Pendiente</option>
              <option value="suspended">Suspendido (Sin Acceso)</option>
            </select>
          </div>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f87171', marginBottom: '0.5rem' }}>
            <AlertCircle size={20} />
            <h3 style={{ fontWeight: 600 }}>Zona de Peligro</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Al suspender un laboratorio, todos sus usuarios y agentes locales perderán acceso inmediato a la plataforma.</p>
          <button type="button" style={{ background: 'none', border: '1px solid #f87171', color: '#f87171', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Eliminar Instancia Permanentemente</button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            disabled={saving}
            type="submit" 
            className="nav-link active" 
            style={{ padding: '0.75rem 2rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
      
      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
