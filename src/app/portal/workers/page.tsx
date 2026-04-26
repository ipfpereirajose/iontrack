import { Search, Filter, ChevronRight, UserCircle, Users, Activity, UserPlus } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import Link from 'next/link';

export default async function WorkersPage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const companyId = profile?.company_id;

  // 2. Fetch Workers for this company
  const { data: workers, error } = await supabase
    .from('toe_workers')
    .select('*')
    .eq('company_id', companyId)
    .order('last_name', { ascending: true });

  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ background: '#a855f7', color: 'white', padding: '0.75rem', borderRadius: '12px' }}>
              <Users size={28} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Directorio de Personal (TOE)</h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Gestión y vigilancia radiológica de los trabajadores ocupacionalmente expuestos.</p>
        </div>
        <Link href="/portal/workers/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
          <UserPlus size={18} />
          Registrar TOE
        </Link>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.875rem', color: 'white' }}
          />
        </div>
        <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', fontWeight: 600 }}>
          <Filter size={18} />
          Filtrar
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', background: 'rgba(255,255,255,0.02)', border: 'none', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Trabajador</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Cédula / ID</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Cargo / Área</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Estatus</th>
              <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!workers || workers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <UserCircle size={48} style={{ opacity: 0.2 }} />
                      <p>No se han registrado trabajadores todavía.</p>
                   </div>
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.5rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                        <UserCircle size={24} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{worker.first_name} {worker.last_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {worker.ci}
                  </td>
                  <td style={{ padding: '1.5rem 1.5rem', fontSize: '0.875rem' }}>
                    {worker.position || 'No especificado'}
                  </td>
                  <td style={{ padding: '1.5rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.35rem 0.85rem', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      background: worker.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)', 
                      color: worker.status === 'active' ? '#4ade80' : 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}>
                      {worker.status === 'active' ? 'Vigilancia Activa' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem 1.5rem', textAlign: 'right' }}>
                    <Link href={`/portal/workers/${worker.id}`} className="btn" style={{ display: 'inline-flex', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <Activity size={18} />
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.8125rem' }}>Ver Dosis</span>
                      <ChevronRight size={16} />
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
