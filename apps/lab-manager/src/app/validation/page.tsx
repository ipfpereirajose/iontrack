import { createClient } from '@supabase/supabase-js';
import { ClipboardCheck, CheckCircle, XCircle, User, Building2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function ValidationPage() {
  // Fetch pending doses with worker and company details
  const { data: doses, error } = await supabase
    .from('doses')
    .select(`
      id,
      month,
      year,
      hp10,
      hp3,
      status,
      worker_id,
      toe_workers (
        first_name,
        last_name,
        ci,
        companies (
          name
        )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  async function approveDose(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    
    // 1. Fetch dose details to check thresholds
    const { data: dose } = await supabase
      .from('doses')
      .select('*, toe_workers(company_id, tenant_id)')
      .eq('id', id)
      .single();

    if (!dose) return;

    // 2. Threshold Check (80% of 1.6mSv monthly limit = 1.28mSv)
    const THRESHOLD = 1.28;
    if (dose.hp10 >= THRESHOLD) {
      await supabase.from('notifications').insert([{
        tenant_id: dose.toe_workers.tenant_id,
        company_id: dose.toe_workers.company_id,
        type: 'threshold_alert',
        message: `ALERTA CRÍTICA: El trabajador ha superado el 80% del límite mensual permitido (${dose.hp10} mSv).`
      }]);
    }

    // 3. Update Status
    const { error } = await supabase
      .from('doses')
      .update({ 
        status: 'approved', 
        approved_at: new Date().toISOString() 
      })
      .eq('id', id);

    // 4. Audit Log (Immutable record)
    await supabase.from('audit_logs').insert([{
      tenant_id: dose.toe_workers.tenant_id,
      action: 'APPROVE_DOSE',
      table_name: 'doses',
      record_id: id,
      new_data: { status: 'approved', value: dose.hp10 },
      justification: 'Validación manual por Oficial de Seguridad'
    }]);

    if (!error) revalidatePath('/validation');
  }

  async function rejectDose(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    
    const { error } = await supabase
      .from('doses')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (!error) revalidatePath('/validation');
  }

  return (
    <div>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClipboardCheck size={32} color="var(--primary)" />
          Bandeja de Validación
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Revisa y aprueba las dosis enviadas por el Agente Local antes de publicarlas a los clientes.
        </p>
      </header>

      {error && (
        <div className="glass-panel" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', marginBottom: '2rem' }}>
          Error al cargar la cola de validación: {error.message}
        </div>
      )}

      {!doses || doses.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
          <CheckCircle size={48} color="var(--secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Todo al día</h3>
          <p style={{ color: 'var(--text-muted)' }}>No hay registros de dosis pendientes de validación.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Trabajador</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Empresa Cliente</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Periodo</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Dosis (Hp10)</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {doses.map((dose: any) => (
                <tr key={dose.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{dose.toe_workers?.first_name} {dose.toe_workers?.last_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CI: {dose.toe_workers?.ci}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <Building2 size={14} color="var(--primary)" />
                      {dose.toe_workers?.companies?.name}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>
                    {dose.month}/{dose.year}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: 700, 
                      color: dose.hp10 > 1.5 ? 'var(--danger)' : 'var(--text-main)' 
                    }}>
                      {dose.hp10}
                    </span>
                    <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem', color: 'var(--text-muted)' }}>mSv</span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <form action={approveDose}>
                        <input type="hidden" name="id" value={dose.id} />
                        <button type="submit" style={{ 
                          background: 'rgba(34, 197, 94, 0.1)', 
                          border: '1px solid rgba(34, 197, 94, 0.2)', 
                          color: '#4ade80',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}>
                          <CheckCircle size={16} />
                          Aprobar
                        </button>
                      </form>
                      <form action={rejectDose}>
                        <input type="hidden" name="id" value={dose.id} />
                        <button type="submit" style={{ 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          border: '1px solid rgba(239, 68, 68, 0.2)', 
                          color: '#f87171',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}>
                          <XCircle size={16} />
                          Rechazar
                        </button>
                      </form>
                    </div>
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
