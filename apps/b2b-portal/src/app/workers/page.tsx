import { createClient } from '@supabase/supabase-js';
import { Users, Search, Filter, ChevronRight, UserCircle } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function WorkersPage() {
  // In a real app, company_id would come from the auth context
  // For this demo, we'll fetch all workers visible to the current RLS
  const { data: workers, error } = await supabase
    .from('toe_workers')
    .select('*')
    .order('last_name', { ascending: true });

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Directorio de Personal (TOE)</h1>
        <p style={{ color: 'var(--text-muted)' }}>Listado de Trabajadores Ocupacionalmente Expuestos y su estatus de vigilancia.</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
        </div>
        <button className="glass-panel" style={{ background: 'white', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <Filter size={18} />
          Filtrar
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', background: 'white', border: 'none', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Trabajador</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Cédula de Identidad</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Cargo / Área</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Estatus</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Historial</th>
            </tr>
          </thead>
          <tbody>
            {!workers || workers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se han registrado trabajadores todavía.
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <UserCircle size={32} color="var(--primary)" style={{ opacity: 0.2 }} />
                      <span style={{ fontWeight: 600 }}>{worker.first_name} {worker.last_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>
                    {worker.ci}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>
                    {worker.position || 'No especificado'}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      background: worker.status === 'active' ? '#dcfce7' : '#f1f5f9', 
                      color: worker.status === 'active' ? '#166534' : '#64748b' 
                    }}>
                      {worker.status === 'active' ? 'Vigilancia Activa' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <Link href={`/workers/${worker.id}`} className="nav-link" style={{ display: 'inline-flex', padding: '0.4rem', border: '1px solid #e2e8f0', background: 'none' }}>
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const revalidate = 0;
