import { ClipboardCheck, CheckCircle, Building2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { approveDose, rejectDose } from './actions';
import ValidationButtons from './ValidationButtons';

export default async function ValidationPage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) return null;

  const tenantId = profile?.tenant_id;

  // 2. Fetch pending doses for THIS lab
  const { data: doses, error } = await supabase
    .from('doses')
    .select(`
      id, month, year, hp10, hp3, status, worker_id,
      toe_workers!inner (
        first_name, last_name, ci,
        companies!inner (name, tenant_id)
      )
    `)
    .eq('status', 'pending')
    .eq('toe_workers.companies.tenant_id', tenantId)
    .order('created_at', { ascending: true });

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ background: 'var(--primary)', color: 'black', padding: '0.75rem', borderRadius: '12px' }}>
            <ClipboardCheck size={28} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Bandeja de Validación</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Revisa y aprueba las dosis enviadas por el Agente Local antes de publicarlas a los clientes.
        </p>
      </header>

      {error && (
        <div className="glass-panel" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.1)' }}>
          <AlertCircle size={20} style={{ marginBottom: '0.5rem' }} />
          <p>Error al cargar la cola de validación: {error.message}</p>
        </div>
      )}

      {!doses || doses.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '6rem', background: 'rgba(255,255,255,0.02)' }}>
          <CheckCircle size={64} color="var(--secondary)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Todo al día</h3>
          <p style={{ color: 'var(--text-muted)' }}>No hay registros de dosis pendientes de validación para este laboratorio.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: 'none', background: 'rgba(255,255,255,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Trabajador</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Empresa Cliente</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Periodo</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Dosis (Hp10)</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {doses.map((dose: any) => (
                <tr key={dose.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{dose.toe_workers?.first_name} {dose.toe_workers?.last_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CI: {dose.toe_workers?.ci}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
                      <Building2 size={16} />
                      {dose.toe_workers?.companies?.name}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
                      {dose.month}/{dose.year}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span style={{ 
                        fontSize: '1.35rem', 
                        fontWeight: 800, 
                        color: dose.hp10 >= 1.28 ? 'var(--danger)' : 'var(--text-main)' 
                      }}>
                        {dose.hp10}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>mSv</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <ValidationButtons doseId={dose.id} approveAction={approveDose} rejectAction={rejectDose} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export const revalidate = 0;
